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

import React, { useEffect, useState } from "react";
import ModalWrapper from "../../Common/ModalWrapper/ModalWrapper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import InputBoxWrapper from "../../Common/FormComponents/InputBoxWrapper/InputBoxWrapper";
import { LinearProgress } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import api from "../../../../common/api";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { modalBasic } from "../../Common/FormComponents/common/styleLibrary";
import { IVolumeConfiguration, IZone } from "./types";
import CheckboxWrapper from "../../Common/FormComponents/CheckboxWrapper/CheckboxWrapper";
import SelectWrapper from "../../Common/FormComponents/SelectWrapper/SelectWrapper";
import { k8sfactorForDropdown } from "../../../../common/utils";
import ZonesMultiSelector from "./ZonesMultiSelector";
import {
  commonFormValidation,
  IValidation,
} from "../../../../utils/validationFunctions";
import GenericWizard from "../../Common/GenericWizard/GenericWizard";
import { IWizardElement } from "../../Common/GenericWizard/types";
import { NewServiceAccount } from "../../Common/CredentialsPrompt/types";
import RadioGroupSelector from "../../Common/FormComponents/RadioGroupSelector/RadioGroupSelector";
import FileSelector from "../../Common/FormComponents/FileSelector/FileSelector";

interface IAddTenantProps {
  open: boolean;
  closeModalAndRefresh: (
    reloadData: boolean,
    res: NewServiceAccount | null
  ) => any;
  classes: any;
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
      alignSelf: "flex-start" as const,
    },
    headerElement: {
      position: "sticky",
      top: 0,
      paddingTop: 5,
      marginBottom: 10,
      backgroundColor: "#fff",
      zIndex: 500,
    },
    tableTitle: {
      fontWeight: 700,
      width: "30%",
    },
    zoneError: {
      color: "#dc1f2e",
      fontSize: "0.75rem",
      paddingLeft: 120,
    },
    ...modalBasic,
  });

interface Opts {
  label: string;
  value: string;
}

const AddTenant = ({
  open,
  closeModalAndRefresh,
  classes,
}: IAddTenantProps) => {
  // Fields
  const [addSending, setAddSending] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>("");
  const [tenantName, setTenantName] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [serviceName, setServiceName] = useState<string>("");
  const [zones, setZones] = useState<IZone[]>([]);
  const [volumesPerServer, setVolumesPerServer] = useState<number>(0);
  const [volumeConfiguration, setVolumeConfiguration] = useState<
    IVolumeConfiguration
  >({ size: 0, storage_class: "" });
  const [mountPath, setMountPath] = useState<string>("");
  const [accessKey, setAccessKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [enableConsole, setEnableConsole] = useState<boolean>(true);
  const [enableTLS, setEnableTLS] = useState<boolean>(false);
  const [sizeFactor, setSizeFactor] = useState<string>("Gi");
  const [storageClasses, setStorageClassesList] = useState<Opts[]>([]);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [namespace, setNamespace] = useState<string>("");
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [enablePrometheus, setEnablePrometheus] = useState<boolean>(false);
  const [consoleImage, setConsoleImage] = useState<string>("");
  const [idpSelection, setIdpSelection] = useState<string>("none");
  const [openIDURL, setOpenIDURL] = useState<string>("");
  const [openIDClientID, setOpenIDClientID] = useState<string>("");
  const [openIDSecretID, setOpenIDSecretID] = useState<string>("");
  const [ADURL, setADURL] = useState<string>("");
  const [ADSkipTLS, setADSkipTLS] = useState<boolean>(false);
  const [ADServerInsecure, setADServerInsecure] = useState<boolean>(false);
  const [ADUserNameFilter, setADUserNameFilter] = useState<string>("");
  const [ADGroupBaseDN, setADGroupBaseDN] = useState<string>("");
  const [ADGroupSearchFilter, setADGroupSearchFilter] = useState<string>("");
  const [ADNameAttribute, setADNameAttribute] = useState<string>("");
  const [tlsType, setTLSType] = useState<string>("autocert");
  const [enableEncryption, setEnableEncryption] = useState<boolean>(false);
  const [encryptionType, setEncryptionType] = useState<string>("vault");
  const [gemaltoEndpoint, setGemaltoEndpoint] = useState<string>("");
  const [gemaltoToken, setGemaltoToken] = useState<string>("");
  const [gemaltoDomain, setGemaltoDomain] = useState<string>("");
  const [gemaltoRetry, setGemaltoRetry] = useState<string>("0");

  // Forms Validation
  const [nameTenantValid, setNameTenantValid] = useState<boolean>(false);
  const [configValid, setConfigValid] = useState<boolean>(false);
  const [configureValid, setConfigureValid] = useState<boolean>(false);
  const [zonesValid, setZonesValid] = useState<boolean>(false);

  // Custom Elements
  const [customACCK, setCustomACCK] = useState<boolean>(false);
  const [customDockerhub, setCustomDockerhub] = useState<boolean>(false);

  useEffect(() => {
    fetchStorageClassList();
  }, []);

  /* Validations of pages */
  useEffect(() => {
    const commonValidation = commonFormValidation([validationElements[0]]);

    setNameTenantValid(!("tenant-name" in commonValidation));

    setValidationErrors(commonValidation);
  }, [tenantName]);

  useEffect(() => {
    let subValidation = validationElements.slice(1, 3);

    if (!advancedMode) {
      subValidation.push({
        fieldKey: "servers",
        required: true,
        pattern: /\d+/,
        customPatternMessage: "Field must be numeric",
        value: zones.length > 0 ? zones[0].servers.toString(10) : "0",
      });
    }

    const commonValidation = commonFormValidation(subValidation);

    setConfigValid(
      !("volumes_per_server" in commonValidation) &&
        !("volume_size" in commonValidation) &&
        !("servers" in commonValidation)
    );

    setValidationErrors(commonValidation);
  }, [volumesPerServer, volumeConfiguration, zones]);

  useEffect(() => {
    let customAccountValidation: IValidation[] = [];
    if (customACCK) {
      customAccountValidation = [
        ...customAccountValidation,
        {
          fieldKey: "access_key",
          required: true,
          value: accessKey,
        },
        {
          fieldKey: "secret_key",
          required: true,
          value: secretKey,
        },
      ];
    }

    if (customDockerhub) {
      customAccountValidation = [
        ...customAccountValidation,
        {
          fieldKey: "image",
          required: true,
          value: imageName,
          pattern: /^((.*?)\/(.*?):(.+))$/,
          customPatternMessage: "Format must be of form: 'minio/minio:VERSION'",
        },
      ];
    }

    const commonVal = commonFormValidation(customAccountValidation);

    setConfigureValid(Object.keys(commonVal).length === 0);

    setValidationErrors(commonVal);
  }, [customACCK, customDockerhub, accessKey, secretKey, imageName]);

  useEffect(() => {
    const filteredZones = zones.filter(
      (zone) => zone.name !== "" && zone.servers !== 0 && !isNaN(zone.servers)
    );

    if (filteredZones.length > 0) {
      setZonesValid(true);
      setValidationErrors({});

      return;
    }

    setZonesValid(false);
    setValidationErrors({ zones_selector: "Please add a valid zone" });
  }, [zones]);

  /* End Validation of pages */

  const validationElements: IValidation[] = [
    {
      fieldKey: "tenant-name",
      required: true,
      pattern: /^[a-z0-9-]{3,63}$/,
      customPatternMessage:
        "Name only can contain lowercase letters, numbers and '-'. Min. Length: 3",
      value: tenantName,
    },
    {
      fieldKey: "volumes_per_server",
      required: true,
      pattern: /\d+/,
      customPatternMessage: "Field must be numeric",
      value: volumesPerServer.toString(10),
    },
    {
      fieldKey: "volume_size",
      required: true,
      pattern: /\d+/,
      customPatternMessage: "Field must be numeric",
      value: volumeConfiguration.size.toString(10),
    },

    {
      fieldKey: "service_name",
      required: false,
      value: serviceName,
    },
  ];

  const clearValidationError = (fieldKey: string) => {
    const newValidationElement = { ...validationErrors };
    delete newValidationElement[fieldKey];

    setValidationErrors(newValidationElement);
  };

  useEffect(() => {
    if (addSending) {
      let cleanZones = zones.filter(
        (zone) => zone.name !== "" && zone.servers > 0 && !isNaN(zone.servers)
      );

      const commonValidation = commonFormValidation(validationElements);

      setValidationErrors(commonValidation);

      if (Object.keys(commonValidation).length === 0) {
        const data: { [key: string]: any } = {
          name: tenantName,
          service_name: tenantName,
          image: imageName,
          enable_tls: enableTLS,
          enable_console: enableConsole,
          access_key: accessKey,
          secret_key: secretKey,
          volumes_per_server: volumesPerServer,
          volume_configuration: {
            size: `${volumeConfiguration.size}${sizeFactor}`,
            storage_class: volumeConfiguration.storage_class,
          },
          zones: cleanZones,
        };

        api
          .invoke("POST", `/api/v1/tenants`, data)
          .then((res) => {
            const newSrvAcc: NewServiceAccount = {
              accessKey: res.access_key,
              secretKey: res.secret_key,
            };

            setAddSending(false);
            setAddError("");
            closeModalAndRefresh(true, newSrvAcc);
          })
          .catch((err) => {
            setAddSending(false);
            setAddError(err);
          });
      } else {
        setAddSending(false);
        setAddError("Please fix the errors in the form and try again");
      }
    }
  }, [addSending]);

  const setVolumeConfig = (item: string, value: string) => {
    const volumeCopy: IVolumeConfiguration = {
      size: item !== "size" ? volumeConfiguration.size : parseInt(value),
      storage_class:
        item !== "storage_class" ? volumeConfiguration.storage_class : value,
    };

    setVolumeConfiguration(volumeCopy);
  };

  const setServersSimple = (value: string) => {
    const copyZone = [...zones];

    copyZone[0].servers = parseInt(value, 10);

    setZones(copyZone);
  };

  const fetchStorageClassList = () => {
    api
      .invoke("GET", `/api/v1/storage-classes`)
      .then((res: string[]) => {
        let classes: string[] = [];
        if (res !== null) {
          classes = res;
        }
        setStorageClassesList(
          classes.map((s: string) => ({
            label: s,
            value: s,
          }))
        );

        const newStorage = { ...volumeConfiguration };
        newStorage.storage_class = res[0];

        setVolumeConfiguration(newStorage);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const cancelButton = {
    label: "Cancel",
    type: "other",
    enabled: true,
    action: () => {
      closeModalAndRefresh(false, null);
    },
  };

  const wizardSteps: IWizardElement[] = [
    {
      label: "Name Tenant",
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>Name Tenant</h3>
            <span>How would you like to name this new tenant?</span>
          </div>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="tenant-name"
              name="tenant-name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTenantName(e.target.value);
                clearValidationError("tenant-name");
              }}
              label="Name"
              value={tenantName}
              required
              error={validationErrors["tenant-name"] || ""}
            />
          </Grid>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="namespace"
              name="namespace"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNamespace(e.target.value);
                clearValidationError("namespace");
              }}
              label="Namespace"
              value={namespace}
              error={validationErrors["namespace"] || ""}
            />
          </Grid>
          <Grid item xs={12}>
            <SelectWrapper
              id="storage_class"
              name="storage_class"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                setVolumeConfig("storage_class", e.target.value as string);
              }}
              label="Storage Class"
              value={volumeConfiguration.storage_class}
              options={storageClasses}
            />
          </Grid>
          <Grid item xs={12}>
            <br />
            <span>
              Check 'Advanced Mode' for additional configuration options, such
              as IDP, Disk Encryption, and customized TLS/SSL Certificates.
              <br />
              Leave 'Advanced Mode' unchecked to use the secure default settings
              for the tenant.
            </span>
            <br />
            <br />
            <CheckboxWrapper
              value="adv_mode"
              id="adv_mode"
              name="adv_mode"
              checked={advancedMode}
              onChange={(e) => {
                const targetD = e.target;
                const checked = targetD.checked;

                setAdvancedMode(checked);
              }}
              label={"Advanced Mode"}
            />
          </Grid>
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Next", type: "next", enabled: nameTenantValid },
      ],
    },
    {
      label: "Configure",
      advancedOnly: true,
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>Configure</h3>
            <span>Basic configurations for tenant management</span>
          </div>

          <Grid item xs={12}>
            <CheckboxWrapper
              value="custom_dockerhub"
              id="custom_dockerhub"
              name="custom_dockerhub"
              checked={customDockerhub}
              onChange={(e) => {
                const targetD = e.target;
                const checked = targetD.checked;

                setCustomDockerhub(checked);
              }}
              label={"Use custom image"}
            />
          </Grid>
          {customDockerhub && (
            <React.Fragment>
              Please enter the MinIO image from dockerhub to use
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="image"
                  name="image"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setImageName(e.target.value);
                    clearValidationError("image");
                  }}
                  label="MinIO's Image"
                  value={imageName}
                  error={validationErrors["image"] || ""}
                  placeholder="Eg. minio/minio:RELEASE.2020-05-08T02-40-49Z"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="consoleImage"
                  name="consoleImage"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConsoleImage(e.target.value);
                    clearValidationError("consoleImage");
                  }}
                  label="Console's Image"
                  value={consoleImage}
                  error={validationErrors["consoleImage"] || ""}
                  placeholder="Eg. minio/console:v0.3.13"
                  required
                />
              </Grid>
            </React.Fragment>
          )}
          <Grid item xs={12}>
            <CheckboxWrapper
              value="enable_prometheus"
              id="enable_prometheus"
              name="enable_prometheus"
              checked={enablePrometheus}
              onChange={(e) => {
                const targetD = e.target;
                const checked = targetD.checked;

                setEnablePrometheus(checked);
              }}
              label={"Enable prometheus integration"}
            />
          </Grid>
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Back", type: "back", enabled: true },
        { label: "Next", type: "next", enabled: configureValid },
      ],
    },
    {
      label: "IDP",
      advancedOnly: true,
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>IDP</h3>
            <span>
              Access to the tenant can be controlled via an external Identity
              Manager.
            </span>
          </div>
          <Grid item xs={12}>
            <RadioGroupSelector
              currentSelection={idpSelection}
              id="idp-options"
              name="idp-options"
              label="IDP Selection"
              onChange={(e) => {
                setIdpSelection(e.target.value);
              }}
              selectorOptions={[
                { label: "None", value: "none" },
                { label: "OpenID", value: "OpenID" },
                { label: "Active Directory", value: "AD" },
              ]}
            />
            MinIO supports both OpenID and Active Directory
          </Grid>

          {idpSelection === "OpenID" && (
            <React.Fragment>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="openID_URL"
                  name="openID_URl"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setOpenIDURL(e.target.value);
                    clearValidationError("openID_URL");
                  }}
                  label="URL"
                  value={openIDURL}
                  error={validationErrors["openID_URL"] || ""}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="openID_clientID"
                  name="openID_clientID"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setOpenIDClientID(e.target.value);
                    clearValidationError("openID_clientID");
                  }}
                  label="Client ID"
                  value={openIDClientID}
                  error={validationErrors["openID_clientID"] || ""}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="openID_secretID"
                  name="openID_secretID"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setOpenIDSecretID(e.target.value);
                    clearValidationError("openID_secretID");
                  }}
                  label="Secret ID"
                  value={openIDSecretID}
                  error={validationErrors["openID_secretID"] || ""}
                  required
                />
              </Grid>
            </React.Fragment>
          )}
          {idpSelection === "AD" && (
            <React.Fragment>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="AD_URL"
                  name="AD_URL"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setADURL(e.target.value);
                    clearValidationError("AD_URL");
                  }}
                  label="URL"
                  value={ADURL}
                  error={validationErrors["AD_URL"] || ""}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <CheckboxWrapper
                  value="ad_skipTLS"
                  id="ad_skipTLS"
                  name="ad_skipTLS"
                  checked={ADSkipTLS}
                  onChange={(e) => {
                    const targetD = e.target;
                    const checked = targetD.checked;

                    setADSkipTLS(checked);
                  }}
                  label={"Skip TLS Verification"}
                />
              </Grid>
              <Grid item xs={12}>
                <CheckboxWrapper
                  value="ad_serverInsecure"
                  id="ad_serverInsecure"
                  name="ad_serverInsecure"
                  checked={ADServerInsecure}
                  onChange={(e) => {
                    const targetD = e.target;
                    const checked = targetD.checked;

                    setADServerInsecure(checked);
                  }}
                  label={"Server Insecure"}
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="ad_userNameFilter"
                  name="ad_userNameFilter"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setADUserNameFilter(e.target.value);
                    clearValidationError("ad_userNameFilter");
                  }}
                  label="User Search Filter"
                  value={ADUserNameFilter}
                  error={validationErrors["ad_userNameFilter"] || ""}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="ad_groupBaseDN"
                  name="ad_groupBaseDN"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setADGroupBaseDN(e.target.value);
                    clearValidationError("ad_groupBaseDN");
                  }}
                  label="Group Search Base DN"
                  value={ADGroupBaseDN}
                  error={validationErrors["ad_groupBaseDN"] || ""}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="ad_groupSearchFilter"
                  name="ad_groupSearchFilter"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setADGroupSearchFilter(e.target.value);
                    clearValidationError("ad_groupSearchFilter");
                  }}
                  label="Group Search Filter"
                  value={ADGroupSearchFilter}
                  error={validationErrors["ad_groupSearchFilter"] || ""}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputBoxWrapper
                  id="ad_nameAttribute"
                  name="ad_nameAttribute"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setADNameAttribute(e.target.value);
                    clearValidationError("ad_nameAttribute");
                  }}
                  label="Group Name Attribute"
                  value={ADNameAttribute}
                  error={validationErrors["ad_nameAttribute"] || ""}
                  required
                />
              </Grid>
            </React.Fragment>
          )}
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Back", type: "back", enabled: true },
        { label: "Next", type: "next", enabled: true },
      ],
    },
    {
      label: "Security",
      advancedOnly: true,
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>Security</h3>
          </div>
          <Grid item xs={12}>
            <CheckboxWrapper
              value="enableTLS"
              id="enableTLS"
              name="enableTLS"
              checked={enableTLS}
              onChange={(e) => {
                const targetD = e.target;
                const checked = targetD.checked;

                setEnableTLS(checked);
              }}
              label={"Enable TLS"}
            />
            Enable TLS for the tenant, this is required for Encryption
            Configuration
          </Grid>
          {enableTLS && (
            <React.Fragment>
              <Grid item xs={12}>
                <RadioGroupSelector
                  currentSelection={tlsType}
                  id="tls-options"
                  name="tls-options"
                  label="TLS Options"
                  onChange={(e) => {
                    setTLSType(e.target.value);
                  }}
                  selectorOptions={[
                    { label: "Autocert", value: "autocert" },
                    { label: "Custom Certificate", value: "customcert" },
                  ]}
                />
              </Grid>
              {tlsType !== "autocert" && (
                <React.Fragment>
                  <h5>MinIO TLS Certs</h5>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".key,.pem"
                      id="tlsKey"
                      name="tlsKey"
                      label="Key"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".cer,.crt,.cert,.pem"
                      id="tlsCert"
                      name="tlsCert"
                      label="Cert"
                      required
                    />
                  </Grid>
                  <h5>Console TLS Certs</h5>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".key,.pem"
                      id="consoleKey"
                      name="consoleKey"
                      label="Key"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".cer,.crt,.cert,.pem"
                      id="consoleCert"
                      name="consoleCert"
                      label="Cert"
                      required
                    />
                  </Grid>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Back", type: "back", enabled: true },
        { label: "Next", type: "next", enabled: true },
      ],
    },
    {
      label: "Encryption",
      advancedOnly: true,
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>Encryption</h3>
            <span>How would you like to encrypt the information at rest.</span>
          </div>
          <Grid item xs={12}>
            <CheckboxWrapper
              value="enableEncryption"
              id="enableEncryption"
              name="enableEncryption"
              checked={enableEncryption}
              onChange={(e) => {
                const targetD = e.target;
                const checked = targetD.checked;

                setEnableEncryption(checked);
              }}
              label={"Enable Server Side Encryption"}
              disabled={!enableTLS}
            />
          </Grid>
          {enableEncryption && (
            <React.Fragment>
              <Grid item xs={12}>
                <RadioGroupSelector
                  currentSelection={encryptionType}
                  id="encryptionType"
                  name="encryptionType"
                  label="Encryption Options"
                  onChange={(e) => {
                    setEncryptionType(e.target.value);
                  }}
                  selectorOptions={[
                    { label: "Vault", value: "vault" },
                    { label: "AWS", value: "aws" },
                    { label: "Gemalto", value: "gemalto" },
                  ]}
                />
              </Grid>

              {enableTLS && tlsType !== "autocert" && (
                <React.Fragment>
                  <h5>Server</h5>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".key,.pem"
                      id="serverKey"
                      name="serverKey"
                      label="Key"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".cer,.crt,.cert,.pem"
                      id="serverCert"
                      name="serverCert"
                      label="Cert"
                      required
                    />
                  </Grid>
                  <h5>Client</h5>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".key,.pem"
                      id="clientKey"
                      name="clientKey"
                      label="Key"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".cer,.crt,.cert,.pem"
                      id="clientCert"
                      name="clientCert"
                      label="Cert"
                      required
                    />
                  </Grid>
                </React.Fragment>
              )}

              {encryptionType === "vault" && (
                <React.Fragment>
                  <h5>Vault</h5>
                </React.Fragment>
              )}
              {encryptionType === "aws" && (
                <React.Fragment>
                  <h5>AWS</h5>
                </React.Fragment>
              )}
              {encryptionType === "gemalto" && (
                <React.Fragment>
                  <Grid item xs={12}>
                    <InputBoxWrapper
                      id="gemalto_endpoint"
                      name="gemalto_endpoint"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setGemaltoEndpoint(e.target.value);
                        clearValidationError("gemalto_endpoint");
                      }}
                      label="Endpoint"
                      value={gemaltoEndpoint}
                      error={validationErrors["gemalto_endpoint"] || ""}
                      required
                    />
                  </Grid>
                  <h5>Credentials</h5>
                  <Grid item xs={12}>
                    <InputBoxWrapper
                      id="gemalto_token"
                      name="gemalto_token"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setGemaltoToken(e.target.value);
                        clearValidationError("gemalto_endpoint");
                      }}
                      label="Token"
                      value={gemaltoToken}
                      error={validationErrors["gemalto_endpoint"] || ""}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputBoxWrapper
                      id="gemalto_domain"
                      name="gemalto_domain"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setGemaltoDomain(e.target.value);
                        clearValidationError("gemalto_domain");
                      }}
                      label="Domain"
                      value={gemaltoDomain}
                      error={validationErrors["gemalto_domain"] || ""}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputBoxWrapper
                      type="number"
                      min="0"
                      id="gemalto_retry"
                      name="gemalto_retry"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setGemaltoRetry(e.target.value);
                      }}
                      label="Domain"
                      value={gemaltoRetry}
                      error={validationErrors["gemalto_retry"] || ""}
                    />
                  </Grid>
                  <h5>TLS</h5>
                  <Grid item xs={12}>
                    <FileSelector
                      onChange={(encodedValue) => {
                        console.log(encodedValue);
                      }}
                      accept=".cer,.crt,.cert,.pem"
                      id="gemalto_ca"
                      name="gemalto_ca"
                      label="CA"
                      required
                    />
                  </Grid>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Back", type: "back", enabled: true },
        { label: "Next", type: "next", enabled: true },
      ],
    },
    {
      label: "Tenant Size",
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>Tenant Size</h3>
            <span>Define the server configuration</span>
          </div>
          {advancedMode && (
            <Grid item xs={12}>
              <InputBoxWrapper
                id="mount_path"
                name="mount_path"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMountPath(e.target.value);
                }}
                label="Mount Path"
                value={mountPath}
              />
            </Grid>
          )}

          {!advancedMode && (
            <Grid item xs={12}>
              <InputBoxWrapper
                id="servers"
                name="servers"
                type="number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setServersSimple(e.target.value);
                  clearValidationError("servers");
                }}
                label="Number of Servers"
                value={zones.length > 0 ? zones[0].servers.toString(10) : "0"}
                min="0"
                required
                error={validationErrors["servers"] || ""}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <InputBoxWrapper
              id="volumes_per_server"
              name="volumes_per_server"
              type="number"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setVolumesPerServer(parseInt(e.target.value));
                clearValidationError("volumes_per_server");
              }}
              label="Volumes per Server"
              value={volumesPerServer.toString(10)}
              min="0"
              required
              error={validationErrors["volumes_per_server"] || ""}
            />
          </Grid>
          <Grid item xs={12}>
            <div className={classes.multiContainer}>
              <div>
                <InputBoxWrapper
                  type="number"
                  id="volume_size"
                  name="volume_size"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setVolumeConfig("size", e.target.value);
                    clearValidationError("volume_size");
                  }}
                  label="Size"
                  value={volumeConfiguration.size.toString(10)}
                  required
                  error={validationErrors["volume_size"] || ""}
                  min="0"
                />
              </div>
              <div className={classes.sizeFactorContainer}>
                <SelectWrapper
                  label=""
                  id="size_factor"
                  name="size_factor"
                  value={sizeFactor}
                  onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                    setSizeFactor(e.target.value as string);
                  }}
                  options={k8sfactorForDropdown()}
                />
              </div>
            </div>
          </Grid>
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Back", type: "back", enabled: true },
        { label: "Next", type: "next", enabled: configValid },
      ],
    },
    {
      label: "Preview Configuration",
      componentRender: (
        <React.Fragment>
          <div className={classes.headerElement}>
            <h3>Review</h3>
            <span>Review the details of the new tenant</span>
          </div>
          {addError !== "" && (
            <Grid item xs={12}>
              <Typography
                component="p"
                variant="body1"
                className={classes.errorBlock}
              >
                {addError}
              </Typography>
            </Grid>
          )}

          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell align="right" className={classes.tableTitle}>
                  Tenant Name
                </TableCell>
                <TableCell>{tenantName}</TableCell>
              </TableRow>
              {customACCK && (
                <React.Fragment>
                  <TableRow>
                    <TableCell align="right" className={classes.tableTitle}>
                      Access Key
                    </TableCell>
                    <TableCell>{accessKey}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="right" className={classes.tableTitle}>
                      Secret Key
                    </TableCell>
                    <TableCell>{secretKey}</TableCell>
                  </TableRow>
                </React.Fragment>
              )}

              {customDockerhub && (
                <TableRow>
                  <TableCell align="right" className={classes.tableTitle}>
                    MinIO Image
                  </TableCell>
                  <TableCell>{imageName}</TableCell>
                </TableRow>
              )}

              {serviceName !== "" && (
                <TableRow>
                  <TableCell align="right" className={classes.tableTitle}>
                    Service Name
                  </TableCell>
                  <TableCell>{serviceName}</TableCell>
                </TableRow>
              )}

              {namespace !== "" && (
                <TableRow>
                  <TableCell align="right" className={classes.tableTitle}>
                    Namespace
                  </TableCell>
                  <TableCell>{namespace}</TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell align="right" className={classes.tableTitle}>
                  Storage Class
                </TableCell>
                <TableCell>{volumeConfiguration.storage_class}</TableCell>
              </TableRow>
              {mountPath !== "" && (
                <TableRow>
                  <TableCell align="right" className={classes.tableTitle}>
                    Mount Path
                  </TableCell>
                  <TableCell>{mountPath}</TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell align="right" className={classes.tableTitle}>
                  Volumes per Server
                </TableCell>
                <TableCell>{volumesPerServer}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right" className={classes.tableTitle}>
                  Volume Size
                </TableCell>
                <TableCell>
                  {volumeConfiguration.size} {sizeFactor}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right" className={classes.tableTitle}>
                  Total Zones
                </TableCell>
                <TableCell>{zones.length}</TableCell>
              </TableRow>
              {advancedMode && (
                <React.Fragment>
                  <TableRow>
                    <TableCell align="right" className={classes.tableTitle}>
                      Enable TLS
                    </TableCell>
                    <TableCell>{enableTLS ? "Enabled" : "Disabled"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="right" className={classes.tableTitle}>
                      Enable Console
                    </TableCell>
                    <TableCell>
                      {enableConsole ? "Enabled" : "Disabled"}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              )}
            </TableBody>
          </Table>
        </React.Fragment>
      ),
      buttons: [
        cancelButton,
        { label: "Back", type: "back", enabled: true },
        {
          label: "Create",
          type: "submit",
          enabled: !addSending,
          action: () => {
            setAddSending(true);
          },
        },
      ],
    },
  ];

  let filteredWizardSteps = wizardSteps;

  if (!advancedMode) {
    filteredWizardSteps = wizardSteps.filter((step) => !step.advancedOnly);
  }

  return (
    <ModalWrapper
      title="Create Tenant"
      modalOpen={open}
      onClose={() => {
        setAddError("");
        closeModalAndRefresh(false, null);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {addSending && (
        <Grid item xs={12}>
          <LinearProgress />
        </Grid>
      )}
      <GenericWizard wizardSteps={filteredWizardSteps} />
    </ModalWrapper>
  );
};

export default withStyles(styles)(AddTenant);
