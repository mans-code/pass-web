import * as React from "react";
import { useTranslation } from "react-i18next";
import { CrossingContext } from "./store";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import { TextCard } from "../../components/Text";
import { TransitionProps } from "@material-ui/core/transitions";
import { decodeB64 } from "../../utils";
import { DocumentType } from "./crossing.types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontSize: "1.8rem",
      color: "#333",
      marginBottom: theme.spacing(3),
    },
    tableSection: { marginTop: theme.spacing(2), padding: theme.spacing(1) },
    subtitle: {
      fontSize: "1rem",
      marginBottom: theme.spacing(1),
      fontWeight: "bold",
      "&.id": {
        color: "rgb(236 35 35 / 80%)",
      },
      "&.phonetic": {
        color: "rgb(236 128 35 / 80%)",
      },
    },
    tableContainer: {
      borderRadius: "8px",
      overflow: "hidden",
      "&.tableID": {
        border: "2px solid rgb(236 35 35 / 80%)",
        "& thead": {
          "& th": {
            color: "#333",
            fontWeight: 600,
            borderBottom: "2px solid rgb(236 35 35 / 80%)",
          },
        },
      },
      "&.tablePhonetic": {
        border: "2px solid rgb(236 128 35 / 80%)",
        "& thead": {
          "& th": {
            color: "#333",
            fontWeight: 600,
            borderBottom: "2px solid rgb(236 128 35 / 80%)",
          },
        },
      },
    },
    table: {},
    appBar: {
      position: "relative",
    },
    dialogContent: {
      width: "100%",
      maxWidth: "1200px",
      padding: "1rem",
      margin: "0 auto",
    },
    dialogBody: {
      backgroundColor: "#fafafa",
      direction: theme.direction,
      flip: false,
    },
    dialogTitle: {
      marginLeft: theme.spacing(2),
      flex: 1,
      textAlign: "left",
    },
    footer: {
      marginTop: theme.spacing(5),
    },
    buttonsGrid: {
      marginTop: theme.spacing(2),
    },
    section: {
      padding: "1rem",
      borderRadius: "8px",
    },
    sectionTitle: {
      marginBottom: "1rem",
      fontWeight: "bold",
      fontSize: "1.2rem",
      color: "#333",
    },
    avatar: {
      order: -1,
      [theme.breakpoints.up("sm")]: { order: 0 },
    },
    faceImg: {
      width: "120px",
      height: "150px",
    },
  })
);

interface IProps {
  doCrossing: () => void;
  cancelCrossing: () => void;
}

interface IState {
  dialogOpen: boolean;
  sourceId: number | null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function RecordDialog({
  handleClose,
  open,
  record,
  travellerName,
  recordType,
}: {
  handleClose: () => void;
  open: boolean;
  record: any;
  travellerName: string;
  recordType: number;
}) {
  const classes = useStyles();
  const { t } = useTranslation(["translation", "enums"]);

  if (!record) return null;

  let details: any;
  if (record.source_code === 1) details = record.wanted_record;
  else if (record.source_code === 2) details = record.miscreant_record;

  const name = record.first_name
    ? `${details.first_name} ${details.father_name} ${details.grandfather_name} ${details.family_name}`
    : travellerName;

  const WantedInfo = () => {
    const personInfo = [
      {
        label: "رقم الهوية",
        value: details.person_id,
      },
      {
        label: "الاسم",
        value: name,
      },
      {
        label: "تاريخ الميلاد (هـ)",
        value: details.birth_date?.hijri_date ?? "-",
      },
      {
        label: "تاريخ الميلاد (م)",
        value: details.birth_date?.gregorian_date ?? "-",
      },
      {
        label: "الجنسية",
        value: record.nationality_arabic_title ?? "-",
      },
    ];

    const caseInfo = [
      {
        label: "رقم القضية",
        value: details.case_number ?? "-",
      },
      {
        label: "الإجراء المطلوب اتخاذه",
        value: details.action_title ?? "-",
      },
      {
        label: "السبب",
        value: details.reason ?? "-",
      },
      {
        label: "درجة الخطورة",
        value: details.danger_level_title ?? "-",
      },
      {
        label: "جهة التسجيل",
        value: details.registrar_entity_title ?? "-",
      },
      {
        label: "تاريخ التسجيل (هـ)",
        value: details.registration_date?.hijri_date ?? "-",
      },
      {
        label: "جهة التسجيل (م)",
        value: details.registration_date?.gregorian_date ?? "-",
      },
      {
        label: "تاريخ التواصل (هـ)",
        value: details.contact_date?.hijri_date ?? "-",
      },
      {
        label: "تاريخ التواصل (م)",
        value: details.contact_date?.gregorian_date ?? "-",
      },
      {
        label: "جهة التبليغ",
        value: details.requester_entity_title ?? "-",
      },
      {
        label: "رقم البلاغ",
        value: details.request_order_number ?? "-",
      },
      {
        label: "تاريخ البلاغ (هـ)",
        value: details.request_date?.hijri_date ?? "-",
      },
      {
        label: "تاريخ البلاغ (م)",
        value: details.request_date?.gregorian_date ?? "-",
      },
      {
        label: "تاريخ بداية حظر السفر (هـ)",
        value: details.travel_ban_start_date?.hijri_date ?? "-",
      },
      {
        label: "تاريخ بداية حظر السفر (م)",
        value: details.travel_ban_start_date?.gregorian_date ?? "-",
      },
      {
        label: "تاريخ انتهاء حظر السفر (هـ)",
        value: details.travel_ban_end_date?.hijri_date ?? "-",
      },
      {
        label: "تاريخ انتهاء حظر السفر (م)",
        value: details.travel_ban_end_date?.gregorian_date ?? "-",
      },
    ];

    return (
      <>
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            البيانات الشخصية
          </Typography>
          <Grid container spacing={3}>
            <Grid
              container
              item
              xs={12}
              sm={details.face_photo_base64 ? 10 : 12}
              spacing={1}
            >
              {personInfo.map((item, index) => (
                <Grid item xs={6} sm={4} lg={3} key={index}>
                  <TextCard outlined label={item.label} value={item.value} />
                </Grid>
              ))}
            </Grid>
            {details.face_photo_base64 ? (
              <Grid item xs={12} sm={2} className={classes.avatar}>
                <Box display="flex" justifyContent="center">
                  <Avatar
                    variant="rounded"
                    alt="Face Photo"
                    src={`data:image/png;base64, ${decodeB64(
                      details.face_photo_base64
                    )}`}
                    className={classes.faceImg}
                  />
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </div>
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            معلومات الحالة
          </Typography>
          <Grid container spacing={3}>
            <Grid container item xs={12} spacing={1}>
              {caseInfo.map((item, index) => (
                <Grid item xs={6} sm={4} lg={3} key={index}>
                  <TextCard outlined label={item.label} value={item.value} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </div>
      </>
    );
  };

  const MiscreantInfo = () => {
    const personInfo = [
      {
        label: "رقم الهوية",
        value: details.person_id,
      },
      {
        label: "الاسم",
        value: name,
      },
      {
        label: "المهنة",
        value: details.occupation ?? "-",
      },
      {
        label: "تاريخ الميلاد (هـ)",
        value: details.birth_date?.hijri_date ?? "-",
      },
      {
        label: "تاريخ الميلاد (م)",
        value: details.birth_date?.gregorian_date ?? "-",
      },
      {
        label: "الجنس",
        value: details.gender ? t(`enums:Gender.${details.gender}`) : "-",
      },
      {
        label: "الجنسية",
        value: record.nationality_arabic_title ?? "-",
      },
      {
        label: "العمر بالهجري",
        value: details.age?.hijri_years ?? "-",
      },
      {
        label: "العمر بالميلادي",
        value: details.age?.gregorian_years ?? "-",
      },
      {
        label: "مكان الميلاد",
        value: details.birth_country ?? "-",
      },
      {
        label: "الديانة",
        value: details.religion ?? "-",
      },
      {
        label: "اسم الأم",
        value: `${details.mother_first_name ?? "-"} ${
          details.mother_family_name ?? "-"
        }`,
      },
      {
        label: "الهوية المنتحلة",
        value: details.imposter_id ?? "-",
      },
      {
        label: "لون البشرة",
        value: details.complexion_title ?? "-",
      },
      {
        label: "لون العين",
        value: details.eye_color_title ?? "-",
      },
      {
        label: "الوجه",
        value: details.visage_title ?? "-",
      },
      {
        label: "لون الشعر",
        value: details.hair_color_title ?? "-",
      },
      {
        label: "الأنف",
        value: details.nose_type_title ?? "-",
      },
      {
        label: "بنية الجسم",
        value: details.body_type_title ?? "-",
      },
      {
        label: "الطول (سم)",
        value: `${details.minimum_height_cm ?? ""} - ${
          details.maximum_height_cm ?? ""
        }`,
      },
      {
        label: "العلامة الفارقة",
        value: details.distinguished_mark ?? "-",
      },
    ];

    return (
      <>
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            البيانات الشخصية
          </Typography>
          <Grid container spacing={3}>
            <Grid
              container
              item
              xs={12}
              sm={details.face_photo_base64 ? 10 : 12}
              spacing={1}
            >
              {personInfo.map((item, index) => (
                <Grid item xs={6} sm={4} lg={3} key={index}>
                  <TextCard outlined label={item.label} value={item.value} />
                </Grid>
              ))}
            </Grid>
            {details.face_photo_base64 ? (
              <Grid item xs={12} sm={2} className={classes.avatar}>
                <Box display="flex" justifyContent="center">
                  <Avatar
                    variant="rounded"
                    alt="Face Photo"
                    src={`data:image/png;base64, ${decodeB64(
                      details.face_photo_base64
                    )}`}
                    className={classes.faceImg}
                  />
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </div>
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>الإجراءات</Typography>
          <Grid container spacing={3}>
            <Grid container item xs={12} spacing={1}>
              {details.miscreant_actions.map((item: any, index: number) => (
                <Chip
                  key={index}
                  style={{
                    margin: "8px",
                  }}
                  label={t(`enums:MiscreantAction.${item}`)}
                  color="secondary"
                />
              ))}
            </Grid>
            {details.miscreant_orders.length ? (
              <Grid item xs={12}>
                <TableContainer
                  component={Paper}
                  className={classes.tableContainer}
                  elevation={0}
                >
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>رقم البلاغ</TableCell>
                        <TableCell>تاريخ البلاغ (هـ)</TableCell>
                        <TableCell align="left">جهة التبليغ</TableCell>
                        <TableCell align="left">الإجراء</TableCell>
                        <TableCell align="center">السبب</TableCell>
                        <TableCell align="center">جهة الإشعار</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.miscreant_orders.map((row: any) => (
                        <TableRow key={row.request_order_number}>
                          <TableCell component="th" scope="row">
                            {row.request_order_number ?? "-"}
                          </TableCell>
                          <TableCell align="left">
                            {row.request_date?.hijri_date ?? "-"}
                          </TableCell>
                          <TableCell align="left">
                            {row.requester_entity_title ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            {row.action_to_be_taken ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            {row.reason_title ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            {row.notify_entity_title ?? "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            ) : null}
          </Grid>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>
                الأسماء المسجلة
              </Typography>
              {details.miscreant_info_list.length ? (
                <TableContainer
                  component={Paper}
                  className={classes.tableContainer}
                  elevation={0}
                >
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>الاسم</TableCell>
                        <TableCell>الجنسية</TableCell>
                        <TableCell align="left">تاريخ الميلاد</TableCell>
                        <TableCell align="left">العمر</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.miscreant_info_list.map(
                        (row: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row">
                              {`${row.first_name ?? "-"} ${
                                row.father_name ?? "-"
                              } ${row.grandfather_name ?? "-"} ${
                                row.family_name ?? "-"
                              } ${row.sub_tribe_name ?? "-"} ${
                                row.tribe_name ?? "-"
                              }`}
                            </TableCell>
                            <TableCell align="left">
                              {row.passport_nationality_title ?? "-"}
                            </TableCell>
                            <TableCell align="left">
                              {row.birth_date?.hijri_date ?? "-"}
                            </TableCell>
                            <TableCell align="left">
                              {row.age?.hijri_years ?? "-"}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>الجوازات</Typography>
              {details.miscreant_passports.length ? (
                <TableContainer
                  component={Paper}
                  className={classes.tableContainer}
                  elevation={0}
                >
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>رقم الجواز</TableCell>
                        <TableCell>الجنسية</TableCell>
                        <TableCell align="left">تاريخ الإصدار (هـ)</TableCell>
                        <TableCell align="left">تاريخ الإصدار (م)</TableCell>
                        <TableCell align="center">مكان الإصدار</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.miscreant_passports.map((row: any) => (
                        <TableRow key={row.passport_number}>
                          <TableCell component="th" scope="row">
                            {row.passport_number ?? "-"}
                          </TableCell>
                          <TableCell align="left">
                            {row.passport_nationality_title ?? "-"}
                          </TableCell>
                          <TableCell align="left">
                            {row.passport_issuance_date?.hijri_date ?? "-"}
                          </TableCell>
                          <TableCell align="left">
                            {row.passport_issuance_date?.gregorian_date ?? "-"}
                          </TableCell>
                          <TableCell align="left">
                            {row.passport_issuance_place ?? "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </div>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            autoFocus
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" className={classes.dialogTitle}>
            {record.source_message} {recordType === 2 ? "(تشابه أسماء)" : ""}
            {" - "}
            {record.source_id}
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <div className={classes.dialogContent}>
          {record.source_code === 1 && <WantedInfo />}
          {record.source_code === 2 && <MiscreantInfo />}
        </div>
      </div>
    </Dialog>
  );
}

function CWL({ doCrossing, cancelCrossing }: IProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { state: crossingState } = React.useContext(CrossingContext);
  const [state, setState] = React.useState({
    dialogOpen: false,
    sourceId: 0,
  });
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      cancelCrossing();
    };

    window.addEventListener("popstate", handleBackButton);

    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  const handleRecordDetails = (sourceId: number) =>
    setState({
      dialogOpen: true,
      sourceId,
    });

  const handleClose = () => setState({ dialogOpen: false, sourceId: 0 });

  const handleCheck = () => setChecked((p) => !p);

  const handleNext = () => {
    doCrossing();
  };

  const listById = crossingState.verificationResponse.watch_list_check_result?.watch_list_by_id_records.filter(
    (r: any) => r.operator_can_see === true
  );

  const listByPhoneticName = crossingState.verificationResponse.watch_list_check_result?.watch_list_by_phonetic_name_records.filter(
    (r: any) => r.operator_can_see === true
  );

  const operatorCanClear =
    [...listById, ...listByPhoneticName].filter(
      (r: any) => r.operator_can_clear === false
    ).length === 0;

  const travellerData =
    crossingState.documentType === DocumentType.ID
      ? crossingState.documentValidationResponse
          .national_id_card_validation_response
      : crossingState.documentValidationResponse
          .saudi_passport_validation_response;

  const travellerName = `${travellerData.person_info.arabic_first_name} ${
    travellerData.person_info.arabic_father_name ?? ""
  } ${travellerData.person_info.arabic_grandfather_name ?? ""} ${
    travellerData.person_info.arabic_family_name
  }`;

  const dialogRecord =
    state.sourceId > 0
      ? [...listById, ...listByPhoneticName].find(
          (r) => r.source_id === state.sourceId
        )
      : null;

  const recordType =
    listById.find(
      (i: { source_id: number }) => i.source_id === state.sourceId
    ) !== undefined
      ? 1
      : 2;

  return (
    <div>
      <Typography variant="h2" className={classes.title}>
        قائمة المراقبة الموحدة
      </Typography>
      {listById.length ? (
        <div className={classes.tableSection}>
          <Typography variant="subtitle1" className={`${classes.subtitle} id`}>
            مسجلة برقم الهوية
          </Typography>
          <TableContainer
            component={Paper}
            className={`${classes.tableContainer} tableID`}
            elevation={0}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>رقم السجل</TableCell>
                  <TableCell align="left">المصدر</TableCell>
                  <TableCell align="left">الإجراء / الوصف</TableCell>
                  <TableCell align="center">تفاصيل السجل</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listById.map((row: any) => (
                  <TableRow key={row.source_id}>
                    <TableCell component="th" scope="row">
                      {row.source_id}
                    </TableCell>
                    <TableCell align="left">{row.source_message}</TableCell>
                    <TableCell align="left">{row.action_message}</TableCell>
                    <TableCell align="center">
                      {row.source_code === 1 || row.source_code === 2 ? (
                        <Button
                          onClick={() => handleRecordDetails(row.source_id)}
                        >
                          للتفاصيل
                        </Button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : null}
      {listByPhoneticName.length ? (
        <div className={classes.tableSection}>
          <Typography
            variant="subtitle1"
            className={`${classes.subtitle} phonetic`}
          >
            تشابه في الاسم
          </Typography>
          <TableContainer
            component={Paper}
            className={`${classes.tableContainer} tablePhonetic`}
            elevation={0}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>رقم السجل</TableCell>
                  <TableCell align="left">المصدر</TableCell>
                  <TableCell align="left">رقم الهوية</TableCell>
                  <TableCell align="left">الإجراء / الوصف</TableCell>
                  <TableCell align="left">الاسم</TableCell>
                  <TableCell align="left">تاريخ الميلاد</TableCell>
                  <TableCell align="left">الجنسية</TableCell>
                  <TableCell align="center">تفاصيل السجل</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listByPhoneticName.map((row: any) => (
                  <TableRow key={row.source_id}>
                    <TableCell component="th" scope="row">
                      {row.source_id}
                    </TableCell>
                    <TableCell align="left">{row.source_message}</TableCell>
                    <TableCell align="left">{row.person_id}</TableCell>
                    <TableCell align="left">{row.action_message}</TableCell>
                    <TableCell align="left">{`${row.first_name ?? "-"} ${
                      row.father_name ?? "-"
                    } ${row.grandfather_name ?? "-"} ${
                      row.family_name ?? "-"
                    }`}</TableCell>
                    <TableCell align="left">
                      {row.birth_date?.hijri_date ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.nationality_arabic_title ?? "-"}
                    </TableCell>
                    <TableCell align="center">
                      {row.source_code === 1 || row.source_code === 2 ? (
                        <Button
                          onClick={() => handleRecordDetails(row.source_id)}
                        >
                          للتفاصيل
                        </Button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : null}
      {state.dialogOpen ? (
        <RecordDialog
          recordType={recordType}
          open={state.dialogOpen}
          handleClose={handleClose}
          record={dialogRecord}
          travellerName={
            recordType === 1
              ? travellerName
              : `${dialogRecord.first_name ?? "-"} ${
                  dialogRecord.father_name ?? "-"
                } ${dialogRecord.grandfather_name ?? "-"} ${
                  dialogRecord.family_name ?? "-"
                }`
          }
        />
      ) : null}
      <div className={classes.footer}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={handleCheck}
              name="confirm"
              disabled={!operatorCanClear}
            />
          }
          label={
            operatorCanClear
              ? t("common->clearCwl")
              : t("common->cannotClearCwl")
          }
        />
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={2}
          className={classes.buttonsGrid}
        >
          <Grid item style={{ order: 2 }}>
            {operatorCanClear && (
              <Button
                variant="contained"
                color="primary"
                disabled={!checked}
                onClick={handleNext}
              >
                {t("common->confirmCwl")}
              </Button>
            )}
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={cancelCrossing}>
              {t("common->cancelCwl")}
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default CWL;
