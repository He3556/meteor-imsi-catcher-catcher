Meteor.methods({
  // Return the result of Reading.insert or false if duplicate entry
  'catcher/readings/insert': function(reading) {
    console.log('catcher/readings/insert');
    console.log(reading);
    check(reading, Match.ObjectIncluding({
      commonReading: {
        readingType: String,
        deviceId: String,
        deviceScannerId: Number,
        debug: Match.Optional(String)
      }
    }))

    // Must register deviceId before can add a reading
    // if(!DeviceId.isClaimed(reading.commonReading.deviceId))
    //   throw new Meteor.Error('invalid-device-id', "DeviceId has not been registered.");


    // Ensure reading is formatted correctly
    var readingCollection =   Catcher.collectionForReadingType(reading.commonReading.readingType);
    check(reading, readingCollection.simpleSchema())

    if(!isDuplicateReading(reading)) {
      console.log('not duplicate');
      return readingCollection.insert(reading);
    } else {
      console.log('is duplicate');
      return false
    }
  }
});

var isDuplicateReading = function(reading) {
  var readingType = reading.commonReading.readingType

  if(readingType === Catcher.READING_TYPES.ANDROID_V1_SIM) {
    return !!Catcher.SIMReadings.findOne({
      "commonReading.deviceId": reading.commonReading.deviceId,
      mcc: reading.mcc,
      mnc: reading.mnc
    })
  } else if(isTelephonyReading(reading)) {
    return !!Catcher.TelephonyReadings.findOne({
      "commonReading.deviceId": reading.commonReading.deviceId,
      cid: reading.cid,
    })
  }

  return false;
}

var isTelephonyReading = function(reading) {
  var readingType = reading.commonReading.readingType

  if((readingType === Catcher.READING_TYPES.ANDROID_V1_GSM) ||
    (readingType === Catcher.READING_TYPES.ANDROID_V17_GSM) ||
    (readingType === Catcher.READING_TYPES.ANDROID_V17_CDMA) ||
    (readingType === Catcher.READING_TYPES.ANDROID_V17_LTE) ||
    (readingType === Catcher.READING_TYPES.ANDROID_V17_WCDMA)) {

    return true;
  }

  return false;
}
