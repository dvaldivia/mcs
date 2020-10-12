// Code generated by go-swagger; DO NOT EDIT.

// This file is part of MinIO Console Server
// Copyright (c) 2020 MinIO, Inc.
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

package user_api

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"net/http"

	"github.com/go-openapi/runtime"

	"github.com/minio/console/models"
)

// GetBucketQuotaOKCode is the HTTP code returned for type GetBucketQuotaOK
const GetBucketQuotaOKCode int = 200

/*GetBucketQuotaOK A successful response.

swagger:response getBucketQuotaOK
*/
type GetBucketQuotaOK struct {

	/*
	  In: Body
	*/
	Payload *models.ListObjectsResponse `json:"body,omitempty"`
}

// NewGetBucketQuotaOK creates GetBucketQuotaOK with default headers values
func NewGetBucketQuotaOK() *GetBucketQuotaOK {

	return &GetBucketQuotaOK{}
}

// WithPayload adds the payload to the get bucket quota o k response
func (o *GetBucketQuotaOK) WithPayload(payload *models.ListObjectsResponse) *GetBucketQuotaOK {
	o.Payload = payload
	return o
}

// SetPayload sets the payload to the get bucket quota o k response
func (o *GetBucketQuotaOK) SetPayload(payload *models.ListObjectsResponse) {
	o.Payload = payload
}

// WriteResponse to the client
func (o *GetBucketQuotaOK) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.WriteHeader(200)
	if o.Payload != nil {
		payload := o.Payload
		if err := producer.Produce(rw, payload); err != nil {
			panic(err) // let the recovery middleware deal with this
		}
	}
}

/*GetBucketQuotaDefault Generic error response.

swagger:response getBucketQuotaDefault
*/
type GetBucketQuotaDefault struct {
	_statusCode int

	/*
	  In: Body
	*/
	Payload *models.Error `json:"body,omitempty"`
}

// NewGetBucketQuotaDefault creates GetBucketQuotaDefault with default headers values
func NewGetBucketQuotaDefault(code int) *GetBucketQuotaDefault {
	if code <= 0 {
		code = 500
	}

	return &GetBucketQuotaDefault{
		_statusCode: code,
	}
}

// WithStatusCode adds the status to the get bucket quota default response
func (o *GetBucketQuotaDefault) WithStatusCode(code int) *GetBucketQuotaDefault {
	o._statusCode = code
	return o
}

// SetStatusCode sets the status to the get bucket quota default response
func (o *GetBucketQuotaDefault) SetStatusCode(code int) {
	o._statusCode = code
}

// WithPayload adds the payload to the get bucket quota default response
func (o *GetBucketQuotaDefault) WithPayload(payload *models.Error) *GetBucketQuotaDefault {
	o.Payload = payload
	return o
}

// SetPayload sets the payload to the get bucket quota default response
func (o *GetBucketQuotaDefault) SetPayload(payload *models.Error) {
	o.Payload = payload
}

// WriteResponse to the client
func (o *GetBucketQuotaDefault) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.WriteHeader(o._statusCode)
	if o.Payload != nil {
		payload := o.Payload
		if err := producer.Produce(rw, payload); err != nil {
			panic(err) // let the recovery middleware deal with this
		}
	}
}