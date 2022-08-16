const {
  fetchParentJurisdictions,
  fetchChildJurisdictionsByInstance,
  fetchChildJurisdictionsByParent,
  serializeJurisdictionFromMahakimData,
  writeJurisdictionsIntoJsonFile,
  jurisdictionTypes,
} = require("./utils");

(async function () {
  try {
    var jurisdictions = [];

    for (const jurisdictionType of jurisdictionTypes) {
      if (jurisdictionType.code === "CC") {
        jurisdictionType["jurisdictions"] = [
          {
            mahakimId: null,
            type: "CC",
            frenchName: "Cour de cassation",
            arabicName: "محكمة النقض",
          },
        ];
        continue;
      }

      console.info(`Fetching jurisdictions of type ${jurisdictionType.code} ...`);

      const mahakimJurisdictions = await fetchParentJurisdictions(jurisdictionType.code);

      for (const mahakimJurisdiction of mahakimJurisdictions) {
        // if it's none appeal court whe need to fetch child insteadof parents jurisdictions
        if (["TPI", "TC", "TA"].includes(jurisdictionType.code)) {
          let mahakimChildJurisdictions = await fetchChildJurisdictionsByInstance(mahakimJurisdiction["idJuridiction"]);
          for (const mahakimChildJurisdiction of mahakimChildJurisdictions) {
            jurisdictions.push(
              await serializeJurisdictionFromMahakimData(mahakimChildJurisdiction, jurisdictionType.code)
            );
          }

          mahakimChildJurisdictions = await fetchChildJurisdictionsByParent(mahakimJurisdiction["idJuridiction"]);
          for (const mahakimChildJurisdiction of mahakimChildJurisdictions) {
            if (!jurisdictions.map(jur => jur["mahakimId"]).includes(mahakimChildJurisdiction["idJuridiction"])) {
              jurisdictions.push(
                await serializeJurisdictionFromMahakimData(mahakimChildJurisdiction, jurisdictionType.code)
              );
            }
          }
        } else {
          jurisdictions.push(await serializeJurisdictionFromMahakimData(mahakimJurisdiction, jurisdictionType.code));
        }
      }

      jurisdictionType["jurisdictions"] = jurisdictions;
      jurisdictions = [];
    }

    writeJurisdictionsIntoJsonFile(jurisdictionTypes);
  } catch (err) {
    console.log(err.response.data["Message"] || err);
  }
})();
