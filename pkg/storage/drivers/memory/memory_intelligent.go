/*
 * Minimalist Object Storage, (C) 2015 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package memory

import (
	"sync"
	"time"
)

var zeroExpiration = time.Duration(0)

// Intelligent holds the required variables to compose an in memory cache system
// which also provides expiring key mechanism and also maxSize
type Intelligent struct {
	// Mutex is used for handling the concurrent
	// read/write requests for cache
	sync.Mutex

	// items hold the cached objects
	items map[string]interface{}

	// updatedAt holds the time that related item's updated at
	updatedAt map[string]time.Time

	// expiration is a duration for a cache key to expire
	expiration time.Duration

	// stopExpireTimer channel to quit the timer thread
	stopExpireTimer chan struct{}

	// maxSize is a total size for overall cache
	maxSize uint64

	// currentSize is a current size in memory
	currentSize uint64

	// OnExpired - callback function for eviction
	OnExpired func(a ...interface{})

	// totalExpired counter to keep track of total expirations
	totalExpired uint64
}

// Stats current cache statistics
type Stats struct {
	Bytes   uint64
	Items   uint64
	Expired uint64
}

// NewIntelligent creates an inmemory cache
//
// maxSize is used for expiring objects before we run out of memory
// expiration is used for expiration of a key from cache
func NewIntelligent(maxSize uint64, expiration time.Duration) *Intelligent {
	return &Intelligent{
		items:      map[string]interface{}{},
		updatedAt:  map[string]time.Time{},
		expiration: expiration,
		maxSize:    maxSize,
	}
}

// Stats get current cache statistics
func (r *Intelligent) Stats() Stats {
	return Stats{
		Bytes:   r.currentSize,
		Items:   uint64(len(r.items)),
		Expired: r.totalExpired,
	}
}

// ExpireObjects expire objects in go routine
func (r *Intelligent) ExpireObjects(gcInterval time.Duration) {
	r.stopExpireTimer = make(chan struct{})
	ticker := time.NewTicker(gcInterval)
	go func() {
		for {
			select {
			case <-ticker.C:
				r.Expire()
			case <-r.stopExpireTimer:
				ticker.Stop()
				return
			}

		}
	}()
}

// Get returns a value of a given key if it exists
func (r *Intelligent) Get(key string) (interface{}, bool) {
	r.Lock()
	defer r.Unlock()
	value, ok := r.items[key]
	if !ok {
		return nil, false
	}
	r.updatedAt[key] = time.Now()
	return value, true
}

// Set will persist a value to the cache
func (r *Intelligent) Set(key string, value interface{}) {
	r.Lock()
	// remove random key if only we reach the maxSize threshold,
	// if not assume infinite memory
	if r.maxSize > 0 {
		for key := range r.items {
			for (r.currentSize + uint64(len(value.([]byte)))) > r.maxSize {
				r.Delete(key)
			}
			break
		}
	}
	r.items[key] = value
	r.currentSize += uint64(len(value.([]byte)))
	r.updatedAt[key] = time.Now()
	r.Unlock()
	return
}

// Expire expires keys which have expired
func (r *Intelligent) Expire() {
	r.Lock()
	defer r.Unlock()
	for key := range r.items {
		if !r.isValid(key) {
			r.Delete(key)
		}
	}
}

// Delete deletes a given key if exists
func (r *Intelligent) Delete(key string) {
	if _, ok := r.items[key]; ok {
		r.currentSize -= uint64(len(r.items[key].([]byte)))
		delete(r.items, key)
		delete(r.updatedAt, key)
		r.totalExpired++
		if r.OnExpired != nil {
			r.OnExpired(key)
		}
	}
}

func (r *Intelligent) isValid(key string) bool {
	updatedAt, ok := r.updatedAt[key]
	if !ok {
		return false
	}
	if r.expiration == zeroExpiration {
		return true
	}
	return updatedAt.Add(r.expiration).After(time.Now())
}