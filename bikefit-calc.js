/**
 * bikefit-calc.js
 * Shared Endurance Squad bike fit formula module.
 * Ported 1:1 from the biomechanical cockpit calculator spreadsheet.
 * No dependencies. Include this file once; both the dashboard and any
 * future page (e.g. a standalone landing-page widget) can call
 * computeBikeFit(inputs) and get the exact same numbers.
 */
(function (global) {
  'use strict';

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  /**
   * @param {Object} inputs
   * @param {number} inputs.inseam            Rider Inseam (cm)
   * @param {number} inputs.crank             Crank Length (mm) - reference only
   * @param {number} inputs.torso             Torso Length (cm)
   * @param {number} inputs.armLength         Arm Length (cm)
   * @param {number} inputs.forearm           Forearm Length (cm)
   * @param {number} inputs.staticAcromion    Static Acromion Width, W_static (cm)
   * @param {number} inputs.elbowFlare        Elbow Flare Width, W_elbow (cm)
   * @param {'Comfort'|'Medium'|'Aggressive'} inputs.aeroAggressiveness
   * @param {number} inputs.toeIn             Wrist Extension Toe-In (degrees)
   * @param {number} inputs.frameStack        Frame Stack, BB to headtube top (cm)
   * @param {number} inputs.frameReach        Frame Reach, BB to headtube top (cm)
   * @param {number} inputs.stemLength        Stem Length (cm)
   * @param {number} inputs.barReach          Handlebar Bar Reach (cm)
   * @returns {Object} core, road, tri, recommended metric groups
   */
  function computeBikeFit(inputs) {
    var inseam = Number(inputs.inseam) || 0;
    var torso = Number(inputs.torso) || 0;
    var armLength = Number(inputs.armLength) || 0;
    var forearm = Number(inputs.forearm) || 0;
    var staticAcromion = Number(inputs.staticAcromion) || 0;
    var elbowFlare = Number(inputs.elbowFlare) || 0;
    var aeroAggressiveness = inputs.aeroAggressiveness || 'Medium';
    var toeIn = Number(inputs.toeIn) || 0;
    var frameStack = Number(inputs.frameStack) || 0;
    var frameReach = Number(inputs.frameReach) || 0;
    var stemLength = Number(inputs.stemLength) || 0;
    var barReach = Number(inputs.barReach) || 0;

    // ---- CORE ----
    var saddleHeight = round1(inseam * 0.883);
    var jointWidth = round1(staticAcromion * 0.905);
    var scapularDelta = round1(staticAcromion - jointWidth);
    var elbowShearDelta = elbowFlare - jointWidth;
    var elbowShearWarning = elbowShearDelta > 3 ? 'HIGH TORQUE \u2013 Narrow Cockpit' : 'OPTIMAL';

    // ---- ROAD ----
    var roadHBReach = round1(torso * 0.45 + armLength * 0.35);
    var roadHBDrop = -6.5; // fixed reference value in source sheet
    var roadGripReachHoods = round1(roadHBReach + barReach);
    var bbToHoodGripReach = round1(frameReach + stemLength + barReach);
    var roadGripDrop = round1(roadHBDrop - 1.0);

    // ---- TRI / TT ----
    var aeroPadReach = round1(forearm * 1.33);
    var aeroPadDrop = -8.1; // fixed reference value in source sheet
    var armPadStackBB = round1(saddleHeight + 14.5);
    var armPadReachBB = round1(frameReach + stemLength - 6.7);
    var armPadToGripReach = round1(forearm - 1.0);
    var triTTGripReach = round1(aeroPadReach + armPadToGripReach);
    var extensionGripAngle = 15; // fixed reference value in source sheet

    // ---- RECOMMENDED OUTPUTS ----
    var roadBikeHandlebarWidth = jointWidth <= 39.0 ? 38 : 40;
    var roadBikeDropFlareWidth = roadBikeHandlebarWidth + 2;

    var padFactor = aeroAggressiveness === 'Aggressive' ? 0.35
      : aeroAggressiveness === 'Comfort' ? 0.45
      : 0.40; // Medium (default)
    var aeroPadCenterWidth = round1(jointWidth * padFactor);
    var aeroExtensionGripWidth = round1(aeroPadCenterWidth * Math.cos(toRadians(toeIn)));
    var extensionGripToPadDelta = round1(aeroPadCenterWidth - aeroExtensionGripWidth);

    return {
      core: {
        saddleHeight: { value: saddleHeight, unit: 'cm', label: 'Saddle Height (BB to Saddle Center)' },
        jointWidth: { value: jointWidth, unit: 'cm', label: 'Dynamic Joint Center Width' },
        scapularDelta: { value: scapularDelta, unit: 'cm', label: 'Scapular Protraction Delta' },
        elbowShearWarning: { value: elbowShearWarning, unit: 'status', label: 'Elbow Shear Warning' }
      },
      road: {
        roadHBReach: { value: roadHBReach, unit: 'cm', label: 'Road Handlebar Reach' },
        roadHBDrop: { value: roadHBDrop, unit: 'cm', label: 'Road Handlebar Drop' },
        roadGripReachHoods: { value: roadGripReachHoods, unit: 'cm', label: 'Road Grip Reach (Hoods)' },
        bbToHoodGripReach: { value: bbToHoodGripReach, unit: 'cm', label: 'BB to Hood Grip Reach' },
        roadGripDrop: { value: roadGripDrop, unit: 'cm', label: 'Road Grip Drop' }
      },
      tri: {
        aeroPadReach: { value: aeroPadReach, unit: 'cm', label: 'Aero Pad Reach' },
        aeroPadDrop: { value: aeroPadDrop, unit: 'cm', label: 'Aero Pad Drop' },
        armPadStackBB: { value: armPadStackBB, unit: 'cm', label: 'Arm Pad Stack (BB)' },
        armPadReachBB: { value: armPadReachBB, unit: 'cm', label: 'Arm Pad Reach (BB)' },
        armPadToGripReach: { value: armPadToGripReach, unit: 'cm', label: 'Arm Pad to Grip Reach' },
        triTTGripReach: { value: triTTGripReach, unit: 'cm', label: 'Tri TT Grip Reach' },
        extensionGripAngle: { value: extensionGripAngle, unit: 'deg', label: 'Extension Grip Angle' }
      },
      recommended: {
        roadBikeHandlebarWidth: { value: roadBikeHandlebarWidth, unit: 'cm', label: 'Road Bike Handlebar Width (Hoods)' },
        roadBikeDropFlareWidth: { value: roadBikeDropFlareWidth, unit: 'cm', label: 'Road Bike Drop Flare Width' },
        aeroPadCenterWidth: { value: aeroPadCenterWidth, unit: 'cm', label: 'Aero Pad Center-to-Center Width (W_pad)' },
        aeroExtensionGripWidth: { value: aeroExtensionGripWidth, unit: 'cm', label: 'Aero Extension Grip Width (W_grip)' },
        extensionGripToPadDelta: { value: extensionGripToPadDelta, unit: 'cm', label: 'Extension Grip-to-Pad Delta' }
      }
    };
  }

  var api = { computeBikeFit: computeBikeFit };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.BikeFitCalc = api;
  }
})(typeof window !== 'undefined' ? window : this);
