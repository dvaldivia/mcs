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

package restapi

import (
	"context"
	"errors"
	"log"

	"github.com/go-openapi/runtime/middleware"
	"github.com/go-openapi/swag"
	"github.com/minio/console/models"
	"github.com/minio/console/restapi/operations"
	"github.com/minio/console/restapi/operations/user_api"
)

func registerAdminBucketRemoteHandlers(api *operations.ConsoleAPI) {
	// return list of remote buckets
	api.UserAPIListRemoteBucketsHandler = user_api.ListRemoteBucketsHandlerFunc(func(params user_api.ListRemoteBucketsParams, session *models.Principal) middleware.Responder {
		listResp, err := getListRemoteBucketsResponse(session)
		if err != nil {
			return user_api.NewListRemoteBucketsDefault(500).WithPayload(&models.Error{Code: 500, Message: swag.String(err.Error())})
		}
		return user_api.NewListRemoteBucketsOK().WithPayload(listResp)
	})

	// return information about a specific bucket
	api.UserAPIRemoteBucketDetailsHandler = user_api.RemoteBucketDetailsHandlerFunc(func(params user_api.RemoteBucketDetailsParams, session *models.Principal) middleware.Responder {
		response, err := getRemoteBucketDetailsResponse(session, params)
		if err != nil {
			return user_api.NewRemoteBucketDetailsDefault(500).WithPayload(&models.Error{Code: 500, Message: swag.String(err.Error())})
		}
		return user_api.NewRemoteBucketDetailsOK().WithPayload(response)
	})
}

func getListRemoteBucketsResponse(session *models.Principal) (*models.ListRemoteBucketsResponse, error) {
	ctx := context.Background()
	mAdmin, err := newMAdminClient(session)
	if err != nil {
		log.Println("error creating Madmin Client:", err)
		return nil, err
	}
	adminClient := adminClient{client: mAdmin}
	buckets, err := listRemoteBuckets(ctx, adminClient)
	if err != nil {
		log.Println("error listing remote buckets:", err)
		return nil, err
	}
	return &models.ListRemoteBucketsResponse{
		Buckets: buckets,
		Total:   int64(len(buckets)),
	}, nil
}

func getRemoteBucketDetailsResponse(session *models.Principal, params user_api.RemoteBucketDetailsParams) (*models.RemoteBucket, error) {
	ctx := context.Background()
	mAdmin, err := newMAdminClient(session)
	if err != nil {
		log.Println("error creating Madmin Client:", err)
		return nil, err
	}
	adminClient := adminClient{client: mAdmin}
	bucket, err := getRemoteBucket(ctx, adminClient, params.Name)
	if err != nil {
		log.Println("error getting remote bucket details:", err)
		return nil, err
	}
	return bucket, nil
}

func listRemoteBuckets(ctx context.Context, client MinioAdmin) ([]*models.RemoteBucket, error) {
	var remoteBuckets []*models.RemoteBucket
	buckets, err := client.listRemoteBuckets(ctx, "", "")
	if err != nil {
		return nil, err
	}
	for _, bucket := range buckets {
		remoteBuckets = append(remoteBuckets, &models.RemoteBucket{
			AccessKey:    &bucket.Credentials.AccessKey,
			RemoteARN:    &bucket.Arn,
			SecretKey:    bucket.Credentials.SecretKey,
			Service:      "replication",
			SourceBucket: &bucket.SourceBucket,
			Status:       "",
			TargetBucket: bucket.TargetBucket,
			TargetURL:    bucket.Endpoint,
		})
	}
	return remoteBuckets, nil
}

func getRemoteBucket(ctx context.Context, client MinioAdmin, name string) (*models.RemoteBucket, error) {
	remoteBucket, err := client.getRemoteBucket(ctx, name, "")
	if err != nil {
		return nil, err
	}
	if remoteBucket == nil {
		return nil, errors.New("bucket not found")
	}
	return &models.RemoteBucket{
		AccessKey:    &remoteBucket.Credentials.AccessKey,
		RemoteARN:    &remoteBucket.Arn,
		SecretKey:    remoteBucket.Credentials.SecretKey,
		Service:      "replication",
		SourceBucket: &remoteBucket.SourceBucket,
		Status:       "",
		TargetBucket: remoteBucket.TargetBucket,
		TargetURL:    remoteBucket.Endpoint,
	}, nil
}
