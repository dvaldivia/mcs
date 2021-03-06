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

import React, { Fragment, useState, useEffect } from "react";
import { connect } from "react-redux";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from "@material-ui/core";
import get from "lodash/get";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AppState } from "../../../../store";
import { setErrorSnackMessage } from "../../../../actions";
import {
  BucketEncryptionInfo,
  BucketInfo,
  BucketObjectLocking,
  BucketQuota,
  BucketReplication,
  BucketVersioning,
} from "../types";
import { niceBytes } from "../../../../common/utils";
import { BucketList } from "../../Watch/types";
import {
  buttonsStyles,
  hrClass,
} from "../../Common/FormComponents/common/styleLibrary";
import api from "../../../../common/api";
import SetAccessPolicy from "./SetAccessPolicy";
import SetRetentionConfig from "./SetRetentionConfig";
import EnableBucketEncryption from "./EnableBucketEncryption";
import EnableVersioningModal from "./EnableVersioningModal";
import UsageIcon from "../../../../icons/UsageIcon";
import GavelIcon from "@material-ui/icons/Gavel";
import EnableQuota from "./EnableQuota";

interface IBucketSummaryProps {
  classes: any;
  match: any;
  distributedSetup: boolean;
  setErrorSnackMessage: typeof setErrorSnackMessage;
}

const styles = (theme: Theme) =>
  createStyles({
    paperContainer: {
      padding: 15,
      paddingLeft: 50,
      display: "flex",
    },
    elementTitle: {
      fontWeight: 500,
      color: "#777777",
      fontSize: 14,
      marginTop: -9,
    },
    consumptionValue: {
      color: "#000000",
      fontSize: "48px",
      fontWeight: "bold",
    },
    reportedUsage: {
      padding: "15px",
    },
    dualCardLeft: {
      paddingRight: "5px",
    },
    dualCardRight: {
      paddingLeft: "5px",
    },
    ...hrClass,
    ...buttonsStyles,
  });

const BucketSummary = ({
  classes,
  match,
  distributedSetup,
  setErrorSnackMessage,
}: IBucketSummaryProps) => {
  const [info, setInfo] = useState<BucketInfo | null>(null);
  const [encryptionCfg, setEncryptionCfg] =
    useState<BucketEncryptionInfo | null>(null);
  const [bucketSize, setBucketSize] = useState<string>("0");
  const [hasObjectLocking, setHasObjectLocking] = useState<boolean>(false);
  const [accessPolicyScreenOpen, setAccessPolicyScreenOpen] =
    useState<boolean>(false);
  const [replicationRules, setReplicationRules] = useState<boolean>(false);
  const [loadingObjectLocking, setLoadingLocking] = useState<boolean>(true);
  const [loadingSize, setLoadingSize] = useState<boolean>(true);
  const [loadingBucket, setLoadingBucket] = useState<boolean>(true);
  const [loadingEncryption, setLoadingEncryption] = useState<boolean>(true);
  const [loadingVersioning, setLoadingVersioning] = useState<boolean>(true);
  const [loadingQuota, setLoadingQuota] = useState<boolean>(true);
  const [loadingReplication, setLoadingReplication] = useState<boolean>(true);
  const [isVersioned, setIsVersioned] = useState<boolean>(false);
  const [quotaEnabled, setQuotaEnabled] = useState<boolean>(false);
  const [quota, setQuota] = useState<BucketQuota | null>(null);
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(false);
  const [retentionConfigOpen, setRetentionConfigOpen] =
    useState<boolean>(false);
  const [enableEncryptionScreenOpen, setEnableEncryptionScreenOpen] =
    useState<boolean>(false);
  const [enableQuotaScreenOpen, setEnableQuotaScreenOpen] =
    useState<boolean>(false);
  const [enableVersioningOpen, setEnableVersioningOpen] =
    useState<boolean>(false);

  const bucketName = match.params["bucketName"];

  let accessPolicy = "n/a";

  if (info !== null) {
    accessPolicy = info.access;
  }

  // Effects

  useEffect(() => {
    if (loadingBucket) {
      api
        .invoke("GET", `/api/v1/buckets/${bucketName}`)
        .then((res: BucketInfo) => {
          setLoadingBucket(false);
          setInfo(res);
        })
        .catch((err) => {
          setLoadingBucket(false);
          setErrorSnackMessage(err);
        });
    }
  }, [loadingBucket, setErrorSnackMessage, bucketName]);

  useEffect(() => {
    if (loadingEncryption) {
      api
        .invoke("GET", `/api/v1/buckets/${bucketName}/encryption/info`)
        .then((res: BucketEncryptionInfo) => {
          if (res.algorithm) {
            setEncryptionEnabled(true);
            setEncryptionCfg(res);
          }
          setLoadingEncryption(false);
        })
        .catch((err) => {
          if (
            err === "The server side encryption configuration was not found"
          ) {
            setEncryptionEnabled(false);
            setEncryptionCfg(null);
          }
          setLoadingEncryption(false);
        });
    }
  }, [loadingEncryption, bucketName]);

  useEffect(() => {
    if (loadingVersioning && distributedSetup) {
      api
        .invoke("GET", `/api/v1/buckets/${bucketName}/versioning`)
        .then((res: BucketVersioning) => {
          setIsVersioned(res.is_versioned);
          setLoadingVersioning(false);
        })
        .catch((err: any) => {
          setErrorSnackMessage(err);
          setLoadingVersioning(false);
        });
    }
  }, [loadingVersioning, setErrorSnackMessage, bucketName, distributedSetup]);

  useEffect(() => {
    if (loadingQuota && distributedSetup) {
      api
        .invoke("GET", `/api/v1/buckets/${bucketName}/quota`)
        .then((res: BucketQuota) => {
          setQuota(res);
          if (res.quota) {
            setQuotaEnabled(true);
          } else {
            setQuotaEnabled(false);
          }
          setLoadingQuota(false);
        })
        .catch((err: any) => {
          setErrorSnackMessage(err);
          setQuotaEnabled(false);
          setLoadingVersioning(false);
        });
    }
  }, [
    loadingQuota,
    setLoadingVersioning,
    setErrorSnackMessage,
    bucketName,
    distributedSetup,
  ]);

  useEffect(() => {
    if (loadingVersioning && distributedSetup) {
      api
        .invoke("GET", `/api/v1/buckets/${bucketName}/object-locking`)
        .then((res: BucketObjectLocking) => {
          setHasObjectLocking(res.object_locking_enabled);
          setLoadingLocking(false);
        })
        .catch((err: any) => {
          setErrorSnackMessage(err);
          setLoadingLocking(false);
        });
    }
  }, [
    loadingObjectLocking,
    setErrorSnackMessage,
    bucketName,
    loadingVersioning,
    distributedSetup,
  ]);

  useEffect(() => {
    if (loadingSize) {
      api
        .invoke("GET", `/api/v1/buckets`)
        .then((res: BucketList) => {
          const resBuckets = get(res, "buckets", []);

          const bucketInfo = resBuckets.find(
            (bucket) => bucket.name === bucketName
          );
          const size = get(bucketInfo, "size", "0");

          setLoadingSize(false);
          setBucketSize(size);
        })
        .catch((err: any) => {
          setLoadingSize(false);
          setErrorSnackMessage(err);
        });
    }
  }, [loadingSize, setErrorSnackMessage, bucketName]);

  useEffect(() => {
    if (loadingReplication && distributedSetup) {
      api
        .invoke("GET", `/api/v1/buckets/${bucketName}/replication`)
        .then((res: BucketReplication) => {
          const r = res.rules ? res.rules : [];
          setReplicationRules(r.length > 0);
          setLoadingReplication(false);
        })
        .catch((err: any) => {
          setErrorSnackMessage(err);
          setLoadingReplication(false);
        });
    }
  }, [loadingReplication, setErrorSnackMessage, bucketName, distributedSetup]);

  const loadAllBucketData = () => {
    setLoadingBucket(true);
    setLoadingSize(true);
    setLoadingVersioning(true);
    setLoadingEncryption(true);
  };

  const setBucketVersioning = () => {
    setEnableVersioningOpen(true);
  };
  const setBucketQuota = () => {
    setEnableQuotaScreenOpen(true);
  };

  const closeEnableBucketEncryption = () => {
    setEnableEncryptionScreenOpen(false);
    setLoadingEncryption(true);
  };
  const closeEnableBucketQuota = () => {
    setEnableQuotaScreenOpen(false);
    setLoadingQuota(true);
  };

  const closeSetAccessPolicy = () => {
    setAccessPolicyScreenOpen(false);
    loadAllBucketData();
  };

  const closeRetentionConfig = () => {
    setRetentionConfigOpen(false);
    loadAllBucketData();
  };

  const closeEnableVersioning = (refresh: boolean) => {
    setEnableVersioningOpen(false);
    if (refresh) {
      loadAllBucketData();
    }
  };

  const cap = (str: string) => {
    if (!str) {
      return null;
    }
    return str[0].toUpperCase() + str.slice(1);
  };

  return (
    <Fragment>
      {enableEncryptionScreenOpen && (
        <EnableBucketEncryption
          open={enableEncryptionScreenOpen}
          selectedBucket={bucketName}
          encryptionEnabled={encryptionEnabled}
          encryptionCfg={encryptionCfg}
          closeModalAndRefresh={closeEnableBucketEncryption}
        />
      )}
      {enableQuotaScreenOpen && (
        <EnableQuota
          open={enableQuotaScreenOpen}
          selectedBucket={bucketName}
          enabled={quotaEnabled}
          cfg={quota}
          closeModalAndRefresh={closeEnableBucketQuota}
        />
      )}
      {accessPolicyScreenOpen && (
        <SetAccessPolicy
          bucketName={bucketName}
          open={accessPolicyScreenOpen}
          actualPolicy={accessPolicy}
          closeModalAndRefresh={closeSetAccessPolicy}
        />
      )}
      {retentionConfigOpen && (
        <SetRetentionConfig
          bucketName={bucketName}
          open={retentionConfigOpen}
          closeModalAndRefresh={closeRetentionConfig}
        />
      )}
      {enableVersioningOpen && (
        <EnableVersioningModal
          closeVersioningModalAndRefresh={closeEnableVersioning}
          modalOpen={enableVersioningOpen}
          selectedBucket={bucketName}
          versioningCurrentState={isVersioned}
        />
      )}
      <br />
      <Paper className={classes.paperContainer}>
        <Grid container>
          <Grid item xs={9}>
            <h2>Details</h2>
            <hr className={classes.hrClass} />
            <table width={"100%"}>
              <tbody>
                <tr>
                  <td className={classes.titleCol}>Access Policy:</td>
                  <td className={classes.capitalizeFirst}>
                    <Button
                      color="primary"
                      className={classes.anchorButton}
                      onClick={() => {
                        setAccessPolicyScreenOpen(true);
                      }}
                    >
                      {loadingBucket ? (
                        <CircularProgress
                          color="primary"
                          size={16}
                          variant="indeterminate"
                        />
                      ) : (
                        accessPolicy.toLowerCase()
                      )}
                    </Button>
                  </td>
                  <td className={classes.titleCol}>Encryption:</td>
                  <td>
                    {loadingEncryption ? (
                      <CircularProgress
                        color="primary"
                        size={16}
                        variant="indeterminate"
                      />
                    ) : (
                      <Button
                        color="primary"
                        className={classes.anchorButton}
                        onClick={() => {
                          setEnableEncryptionScreenOpen(true);
                        }}
                      >
                        {encryptionEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    )}
                  </td>
                </tr>
                {distributedSetup && (
                  <tr>
                    <td className={classes.titleCol}>Replication:</td>
                    <td className={classes.doubleElement}>
                      <span>{replicationRules ? "Enabled" : "Disabled"}</span>
                    </td>
                    {!hasObjectLocking ? (
                      <React.Fragment>
                        <td className={classes.titleCol}>Object Locking:</td>
                        <td>Disabled</td>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <td colSpan={2}></td>
                      </React.Fragment>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </Grid>
          <Grid item xs={3} className={classes.reportedUsage}>
            <Grid container direction="row" alignItems="center">
              <Grid item className={classes.icon} xs={2}>
                <UsageIcon />
              </Grid>
              <Grid item xs={10}>
                <Typography className={classes.elementTitle}>
                  Reported Usage
                </Typography>
              </Grid>
            </Grid>
            <Typography className={classes.consumptionValue}>
              {niceBytes(bucketSize)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <br />
      <br />
      {distributedSetup && (
        <Fragment>
          <Paper className={classes.paperContainer}>
            <Grid container>
              <Grid item xs={quotaEnabled ? 9 : 12}>
                <h2>Versioning</h2>
                <hr className={classes.hrClass} />
                <table width={"100%"}>
                  <tbody>
                    <tr>
                      <td className={classes.titleCol}>Versioning:</td>
                      <td>
                        {loadingVersioning ? (
                          <CircularProgress
                            color="primary"
                            size={16}
                            variant="indeterminate"
                          />
                        ) : (
                          <Fragment>
                            <Button
                              color="primary"
                              className={classes.anchorButton}
                              onClick={setBucketVersioning}
                            >
                              {isVersioned ? "Enabled" : "Disabled"}
                            </Button>
                          </Fragment>
                        )}
                      </td>
                      <td className={classes.titleCol}>Quota:</td>
                      <td>
                        {loadingQuota ? (
                          <CircularProgress
                            color="primary"
                            size={16}
                            variant="indeterminate"
                          />
                        ) : (
                          <Fragment>
                            <Button
                              color="primary"
                              className={classes.anchorButton}
                              onClick={setBucketQuota}
                            >
                              {quotaEnabled ? "Enabled" : "Disabled"}
                            </Button>
                          </Fragment>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Grid>
              {quotaEnabled && quota && (
                <Grid item xs={3} className={classes.reportedUsage}>
                  <Grid container direction="row" alignItems="center">
                    <Grid item className={classes.icon} xs={2}>
                      <GavelIcon />
                    </Grid>
                    <Grid item xs={10}>
                      <Typography className={classes.elementTitle}>
                        {cap(quota?.type)} Quota
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography className={classes.consumptionValue}>
                    {niceBytes(`${quota?.quota}`)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          <br />
          <br />
        </Fragment>
      )}

      {hasObjectLocking && (
        <Paper className={classes.paperContainer}>
          <Grid container>
            <Grid item xs={12}>
              <h2>Object Locking</h2>
              <hr className={classes.hrClass} />
              <table>
                <tbody>
                  <tr className={classes.gridContainer}>
                    <td className={classes.titleCol}>Retention:</td>
                    <td>
                      {loadingVersioning ? (
                        <CircularProgress
                          color="primary"
                          size={16}
                          variant="indeterminate"
                        />
                      ) : (
                        <Fragment>
                          <Button
                            color="primary"
                            className={classes.anchorButton}
                            onClick={() => {
                              setRetentionConfigOpen(true);
                            }}
                          >
                            Configure
                          </Button>
                        </Fragment>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Fragment>
  );
};

const mapState = (state: AppState) => ({
  session: state.console.session,
  distributedSetup: state.system.distributedSetup,
});

const connector = connect(mapState, {
  setErrorSnackMessage,
});

export default withStyles(styles)(connector(BucketSummary));
