var fs = require("fs");
var axios = require("axios");
const translate = require("@vitalets/google-translate-api");

axios.defaults.baseURL = "https://www.mahakim.ma/Ar/Services/SuiviAffaires_new/JFunctions/fn.aspx";

const capitalize = text => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const translateJurisdictionName = async arabicName => {
  const res = await translate(arabicName, { to: "fr" }).catch(err => {
    console.error(err);
  });

  return capitalize(res.text);
};

exports.jurisdictionTypes = [
  {
    code: "CA",
    frenchName: "Cours d'appel",
    arabicName: "محاكم الإستئناف",
  },
  {
    code: "TPI",
    frenchName: "Tribunaux de première instance",
    arabicName: "المحاكم الإبتدائية",
  },
  {
    code: "CAC",
    frenchName: "Cours d'appel de commerce",
    arabicName: "محاكم الإستئناف التجارية",
  },
  {
    code: "TC",
    frenchName: "Tribunaux de commerce",
    arabicName: "المحاكم التجارية",
  },
  {
    code: "CAA",
    frenchName: "Cours administratives d'appel",
    arabicName: "محاكم الإستئناف الإدارية",
  },
  {
    code: "TA",
    frenchName: "Tribunaux administratifs",
    arabicName: "المحاكم الإدارية",
  },
  {
    code: "CC",
    frenchName: "Cour de cassation",
    arabicName: "محكمة النقض",
  },
];

exports.serializeJurisdictionFromMahakimData = async (mahakimJurisdiction, type) => {
  const arabicName = mahakimJurisdiction["nomJuridiction"].trim();
  const frenchName = await translateJurisdictionName(arabicName);

  return {
    mahakimId: mahakimJurisdiction["idJuridiction"],
    type,
    frenchName,
    arabicName,
  };
};

exports.fetchParentJurisdictions = async jurisdictionTypeCode => {
  const res = await axios.post("/getCA", { typeJuridiction: jurisdictionTypeCode });

  return res.data["d"];
};

exports.fetchChildJurisdictionsByInstance = async secondJurisdictionInstanceId => {
  const res = await axios.post("/getJuridiction1instance", {
    IdJuridiction2Instance: secondJurisdictionInstanceId,
  });

  return res.data["d"];
};

exports.fetchChildJurisdictionsByParent = async parentJurisdictionId => {
  const res = await axios.post("/GetListJuridByIdJuridParent", {
    IdJuridictionParent: parentJurisdictionId,
  });

  return res.data["d"];
};

exports.writeJurisdictionsIntoJsonFile = jurisdictionsGroupedByType => {
  fs.readFile("jurisdictions-groupedby-type.json", (err, data) => {
    if (err) console.error("Error reading the jurisdictions-groupedby-type file");

    let jurisdictionsGroupedByTypeList = JSON.parse(data);
    jurisdictionsGroupedByTypeList = jurisdictionsGroupedByType;

    console.info("Writing to jurisdictions-groupedby-type file ...");

    fs.writeFile("jurisdictions-groupedby-type.json", JSON.stringify(jurisdictionsGroupedByTypeList), err => {
      if (err) console.error("Error Writing to jurisdictions-groupedby-type");

      console.info(`Jurisdictions grouped by type were written into the file successfully`);
    });
  });
};
