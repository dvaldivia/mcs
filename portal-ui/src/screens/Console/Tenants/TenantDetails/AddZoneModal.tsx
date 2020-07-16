import React, { useState, useEffect } from "react";
import ModalWrapper from "../../Common/ModalWrapper/ModalWrapper";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import {
  factorForDropdown,
  generateZoneName,
  getTotalSize,
  niceBytes,
} from "../../../../common/utils";
import { Button, LinearProgress } from "@material-ui/core";
import { modalBasic } from "../../Common/FormComponents/common/styleLibrary";
import InputBoxWrapper from "../../Common/FormComponents/InputBoxWrapper/InputBoxWrapper";
import { IZone } from "../ListTenants/types";
import api from "../../../../common/api";

interface IAddZoneProps {
  classes: any;
  open: boolean;
  onCloseZoneAndReload: (shouldReload: boolean) => void;
  volumesPerInstance: number;
  volumeSize: number;
  zones: IZone[];
  tenantName: string;
  namespace: string;
}

const styles = (theme: Theme) =>
  createStyles({
    errorBlock: {
      color: "red",
    },
    buttonContainer: {
      textAlign: "right",
    },
    multiContainer: {
      display: "flex",
      alignItems: "center" as const,
      justifyContent: "flex-start" as const,
    },
    sizeFactorContainer: {
      marginLeft: 8,
    },
    bottomContainer: {
      display: "flex",
      flexGrow: 1,
      alignItems: "center",
      "& div": {
        flexGrow: 1,
        width: "100%",
      },
    },
    factorElements: {
      display: "flex",
      justifyContent: "flex-start",
    },
    sizeNumber: {
      fontSize: 35,
      fontWeight: 700,
      textAlign: "center",
    },
    sizeDescription: {
      fontSize: 14,
      color: "#777",
      textAlign: "center",
    },
    ...modalBasic,
  });

const AddZoneModal = ({
  classes,
  open,
  onCloseZoneAndReload,
  volumesPerInstance,
  volumeSize,
  zones,
  tenantName,
  namespace,
}: IAddZoneProps) => {
  const [addSending, setAddSending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [numberOfInstances, setNumberOfInstances] = useState<number>(0);

  useEffect(() => {
    if (addSending) {
      const zoneName = generateZoneName(zones);

      api
        .invoke(
          "POST",
          `/api/v1/namespaces/${namespace}/tenants/${tenantName}/zones`,
          {
            name: zoneName,
            servers: numberOfInstances,
          }
        )
        .then((res) => {
          setAddSending(false);
          setError("");
          onCloseZoneAndReload(true);
        })
        .catch((err) => {
          setAddSending(false);
          setError(err);
        });
    }
  }, [addSending]);

  const instanceCapacity: number = volumeSize * volumesPerInstance;
  const totalCapacity: number = instanceCapacity * numberOfInstances;

  return (
    <ModalWrapper
      onClose={() => onCloseZoneAndReload(false)}
      modalOpen={open}
      title="Add Zone"
    >
      <form
        noValidate
        autoComplete="off"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setAddSending(true);
        }}
      >
        <div className={classes.errorBlock}>{error}</div>
        <Grid item xs={12}>
          <InputBoxWrapper
            id="number_instances"
            name="number_instances"
            type="number"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNumberOfInstances(parseInt(e.target.value));
            }}
            label="Number of Instances"
            value={numberOfInstances.toString(10)}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12} className={classes.bottomContainer}>
            <div className={classes.factorElements}>
              <div>
                <div className={classes.sizeNumber}>
                  {niceBytes(instanceCapacity.toString(10))}
                </div>
                <div className={classes.sizeDescription}>Instance Capacity</div>
              </div>
              <div>
                <div className={classes.sizeNumber}>
                  {niceBytes(totalCapacity.toString(10))}
                </div>
                <div className={classes.sizeDescription}>Total Capacity</div>
              </div>
            </div>
            <div className={classes.buttonContainer}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={addSending}
              >
                Save
              </Button>
            </div>
          </Grid>
          {addSending && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </form>
    </ModalWrapper>
  );
};

export default withStyles(styles)(AddZoneModal);
