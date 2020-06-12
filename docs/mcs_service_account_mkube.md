# MCS service account authentication with Mkube

`MCS` will authenticate against `Mkube`using bearer tokens via HTTP `Authorization` header.

# Kubernetes

By default, if you don't provide `MCS_K8S_SA_JWT` mcs will assume is running inside a `kubernetes` pod and will try to read
the jwt from `/var/run/secrets/kubernetes.io/serviceaccount/token` and use it.

The provided `JWT token` corresponds to the `Kubernetes service account` that `Mkube` will use to run tasks on behalf of `MCS`
ie: list, create, edit, delete tenants, storage class, etc.

# Development

If you are running mcs in your local environment and wish to make request to `Mkube` you can set `MCS_M3_HOSTNAME`, if
the environment variable is not present by default `MCS` will use `"http://m3:8787"`

## Extract the Service account token and use it with MCS

For local development you can use the jwt associated to the `m3-sa` service account, you can get the token running
the following command in your terminal:

```
kubectl get secret $(kubectl get serviceaccount m3-sa -o jsonpath="{.secrets[0].name}") -o jsonpath="{.data.token}" | base64 --decode
```

Then run the mcs server

```
MCS_M3_HOSTNAME=http://localhost:8787 MCS_K8S_SA_JWT=eyJh... ./mcs server
```