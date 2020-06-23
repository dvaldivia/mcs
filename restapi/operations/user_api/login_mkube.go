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
// Editing this file might prove futile when you re-run the generate command

import (
	"net/http"

	"github.com/go-openapi/runtime/middleware"
)

// LoginMkubeHandlerFunc turns a function with the right signature into a login mkube handler
type LoginMkubeHandlerFunc func(LoginMkubeParams) middleware.Responder

// Handle executing the request and returning a response
func (fn LoginMkubeHandlerFunc) Handle(params LoginMkubeParams) middleware.Responder {
	return fn(params)
}

// LoginMkubeHandler interface for that can handle valid login mkube params
type LoginMkubeHandler interface {
	Handle(LoginMkubeParams) middleware.Responder
}

// NewLoginMkube creates a new http.Handler for the login mkube operation
func NewLoginMkube(ctx *middleware.Context, handler LoginMkubeHandler) *LoginMkube {
	return &LoginMkube{Context: ctx, Handler: handler}
}

/*LoginMkube swagger:route POST /login/mkube UserAPI loginMkube

Login to Mkube.

*/
type LoginMkube struct {
	Context *middleware.Context
	Handler LoginMkubeHandler
}

func (o *LoginMkube) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	route, rCtx, _ := o.Context.RouteInfo(r)
	if rCtx != nil {
		r = rCtx
	}
	var Params = NewLoginMkubeParams()

	if err := o.Context.BindValidRequest(r, route, &Params); err != nil { // bind params
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}

	res := o.Handler.Handle(Params) // actually handle the request

	o.Context.Respond(rw, r, route.Produces, route, res)

}