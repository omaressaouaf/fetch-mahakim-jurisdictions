const {
  fetchParentJurisdictions,
  fetchChildJurisdictionsByInstance,
  fetchChildJurisdictionsByParent,
  serializeJurisdictionFromMahakimData,
  writeJurisdictionsIntoJsonFile,
} = require("./utils");

(async function () {
  try {
    var jurisdictions = [];

    for (const jurisdictionType of ["CA", "TPI", "CAC", "TC", "CAA", "TA"]) {
      console.info(`Fetching jurisdictions of type ${jurisdictionType} ...`);

      const mahakimJurisdictions = await fetchParentJurisdictions(jurisdictionType);

      for (const mahakimJurisdiction of mahakimJurisdictions) {
        // if it's none appeal court whe need to fetch child insteadof parents jurisdictions
        if (["TPI", "TC", "TA"].includes(jurisdictionType)) {
          let mahakimChildJurisdictions = await fetchChildJurisdictionsByInstance(mahakimJurisdiction["idJuridiction"]);
          for (const mahakimChildJurisdiction of mahakimChildJurisdictions) {
            jurisdictions.push(await serializeJurisdictionFromMahakimData(mahakimChildJurisdiction, jurisdictionType));
          }

          mahakimChildJurisdictions = await fetchChildJurisdictionsByParent(mahakimJurisdiction["idJuridiction"]);
          for (const mahakimChildJurisdiction of mahakimChildJurisdictions) {
            if (!jurisdictions.map(jur => jur.id).includes(mahakimChildJurisdiction["idJuridiction"])) {
              jurisdictions.push(await serializeJurisdictionFromMahakimData(mahakimChildJurisdiction, jurisdictionType));
            }
          }
        } else {
          jurisdictions.push(await serializeJurisdictionFromMahakimData(mahakimJurisdiction, jurisdictionType));
        }
      }
    }

    writeJurisdictionsIntoJsonFile(jurisdictions);
  } catch (err) {
    console.log(err.response.data["Message"] || err);
  }
})();
