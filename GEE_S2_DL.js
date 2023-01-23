//Make sure to change geometry to your AOI
var batch = require('users/fitoprincipe/geetools:batch');

//Parameters
var start_date = '2018-04-05';
var end_date = '2018-12-25';
var Cloudy_Percentage = 30;

//Functions
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

function quickMask(image){
  return image.divide(10000);
}

//Main
var dataset = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate(start_date, end_date)
                  .filterBounds(geometry)
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', Cloudy_Percentage))
                  .map(quickMask);

print(dataset);

//Export
//Use Either first batch for all bands or second for just RGB bands
//Comment out the batch that you are not using to improve performance

batch.Download.ImageCollection.toDrive(dataset, 'GERD', 
                {type: 'float'});

var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

// Create RGB visualization images for use as animation frames
var rgbVis = dataset.map(function(img) {
  return img.visualize(visualization);
});

batch.Download.ImageCollection.toDrive(rgbVis, 'GERD', 
                {type: 'float'});
