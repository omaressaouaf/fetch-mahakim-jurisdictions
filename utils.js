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

exports.writeJurisdictionsIntoJsonFile = jurisdictions => {
  fs.readFile("jurisdictions.json", (err, data) => {
    if (err) console.error("Error reading the jurisdictions file");

    let jurisdictionsList = JSON.parse(data);
    jurisdictionsList = jurisdictions;

    console.info("Writing to jurisdictions file ...");

    fs.writeFile("jurisdictions.json", JSON.stringify(jurisdictionsList), err => {
      if (err) console.error("Error Writing to jurisdictionTypes");

      console.info(`Jurisdictions were written into the file successfully`);
    });
  });
};
