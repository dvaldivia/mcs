// Code generated by go-swagger; DO NOT EDIT.

// This file is part of MinIO Console Server
// Copyright (c) 2021 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

package models

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"
)

// AddBucketLifecycle add bucket lifecycle
//
// swagger:model addBucketLifecycle
type AddBucketLifecycle struct {

	// disable
	Disable bool `json:"disable,omitempty"`

	// expired object delete marker
	ExpiredObjectDeleteMarker bool `json:"expired_object_delete_marker,omitempty"`

	// expiry date
	ExpiryDate string `json:"expiry_date,omitempty"`

	// expiry days
	ExpiryDays int32 `json:"expiry_days,omitempty"`

	// noncurrentversion expiration days
	NoncurrentversionExpirationDays int32 `json:"noncurrentversion_expiration_days,omitempty"`

	// noncurrentversion transition days
	NoncurrentversionTransitionDays int32 `json:"noncurrentversion_transition_days,omitempty"`

	// noncurrentversion transition storage class
	NoncurrentversionTransitionStorageClass string `json:"noncurrentversion_transition_storage_class,omitempty"`

	// prefix
	Prefix string `json:"prefix,omitempty"`

	// storage class
	StorageClass string `json:"storage_class,omitempty"`

	// tags
	Tags string `json:"tags,omitempty"`

	// transition date
	TransitionDate string `json:"transition_date,omitempty"`

	// transition days
	TransitionDays int32 `json:"transition_days,omitempty"`
}

// Validate validates this add bucket lifecycle
func (m *AddBucketLifecycle) Validate(formats strfmt.Registry) error {
	return nil
}

// MarshalBinary interface implementation
func (m *AddBucketLifecycle) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *AddBucketLifecycle) UnmarshalBinary(b []byte) error {
	var res AddBucketLifecycle
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
