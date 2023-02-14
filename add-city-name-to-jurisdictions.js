var fs = require("fs");

fs.readFile("jurisdictions-groupedby-type-with-city-name.json", (err, data) => {
  if (err) console.error("Error reading jurisdictions-groupedby-type-with-city-name.json");

  let jurisdictionsGroupedByType = JSON.parse(data);

  jurisdictionsGroupedByType.forEach((jurisdictionType, jurisdictionTypeIndex) => {
    jurisdictionType.jurisdictions.forEach((jurisdiction, jurisdictionIndex) => {
      jurisdictionsGroupedByType[jurisdictionTypeIndex]["jurisdictions"][jurisdictionIndex] = {
        ...jurisdiction,
        cityFrenchName: "",
      };
    });
  });

  fs.writeFile("jurisdictions-groupedby-type-with-city-name.json", JSON.stringify(jurisdictionsGroupedByType), err => {
    if (err) console.error("Error Writing to jurisdictions-groupedby-type-with-city-name.json");

    console.info(`City number was written into jurisdictions-groupedby-type-with-city-name.json successfully`);
  });
});
