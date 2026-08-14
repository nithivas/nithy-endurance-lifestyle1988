/**
 * bikefit-calc.js
 * Shared Endurance Squad bike fit formula module.
 * Ported 1:1 from the biomechanical cockpit calculator spreadsheet.
 * Supports Node.js, ES6 imports, and direct browser global usage.
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
   * Main calculation engine.
   * @param {Object} inputs
   * @param {number} inputs.inseam            Rider Inseam (cm)
   * @param {number} [inputs.crank=165]       Crank Length (mm) - reference
   * @param {number} inputs.torso             Torso Length (cm)
   * @param {number} inputs.armLength         Arm Length (cm)
   * @param {number} inputs.forearm           Forearm Length (cm)
   * @param {number} inputs.staticAcromion    Static Acromion Width, W_static (cm)
   * @param {number} inputs.elbowFlare        Elbow Flare Width, W_elbow (cm)
   * @param {'Comfort'|'Medium'|'Aggressive'} [inputs.aeroAggressiveness='Medium']
   * @param {number} [inputs.toeIn=12]        Wrist Extension Toe-In (degrees)
   * @param {number} inputs.frameStack        Frame Stack, BB to headtube top (cm)
   * @param {number} inputs.frameReach        Frame Reach, BB to headtube top (cm)
   * @param {number} inputs.stemLength        Stem Length (cm)
   * @param {number} inputs.barReach          Handlebar Bar Reach (cm)
   * @returns {Object} Categorized metrics with raw values, units, labels, and notes
   */
  function computeBikeFit(inputs) {
    inputs = inputs || {};

    const inseam = Number(inputs.inseam) || 0;
    const torso = Number(inputs.torso) || 0;
    const armLength = Number(inputs.armLength) || 0;
    const forearm = Number(inputs.forearm) || 0;
    const staticAcromion = Number(inputs.staticAcromion) || 0;
    const elbowFlare = Number(inputs.elbowFlare) || 0;
    const aeroAggressiveness = inputs.aeroAggressiveness || 'Medium';
    const toeIn = Number(inputs.toeIn) || 12; // Default 12 deg
    const frameStack = Number(inputs.frameStack) || 0;
    const frameReach = Number(inputs.frameReach) || 0;
    const stemLength = Number(inputs.stemLength) || 0;
    const barReach = Number(inputs.barReach) || 0;

    // ---- CORE BIOMECHANICS ----
    const saddleHeight = round1(inseam * 0.883);
    const jointWidth = round1(staticAcromion * 0.905);
    const scapularDelta = round1(staticAcromion - jointWidth);
    const elbowShearDelta = round1(elbowFlare - jointWidth);
    const elbowShearWarning = elbowShearDelta > 3 ? 'HIGH TORQUE – Narrow Cockpit' : 'OPTIMAL';

    // ---- ROAD COCKPIT ----
    const roadHBReach = round1(torso * 0.45 + armLength * 0.35);
    const roadHBDrop = -6.5; // Fixed reference value
    const roadGripReachHoods = round1(roadHBReach + barReach);
    const bbToHoodGripReach = round1(frameReach + stemLength + barReach);
    const roadGripDrop = round1(roadHBDrop - 1.0);

    // ---- TRIATHLON / TT COCKPIT ----
    const aeroPadReach = round1(forearm * 1.33);
    const aeroPadDrop = -8.1; // Fixed reference value
    const armPadStackBB = round1(saddleHeight + 14.5);
    const armPadReachBB = round1(frameReach + stemLength - 6.7);
    const armPadToGripReach = round1(forearm - 1.0);
    const triTTGripReach = round1(aeroPadReach + armPadToGripReach);
    const extensionGripAngle = 15; // Fixed reference value

    // ---- RECOMMENDED OUTPUTS ----
    const roadBikeHandlebarWidth = jointWidth <= 39.0 ? 38 : 40;
    const roadBikeDropFlareWidth = roadBikeHandlebarWidth + 2;

    const padFactor = aeroAggressiveness === 'Aggressive' ? 0.35
      : aeroAggressiveness === 'Comfort' ? 0.45
      : 0.40; // Medium default

    const aeroPadCenterWidth = round1(jointWidth * padFactor);
    const aeroExtensionGripWidth = round1(aeroPadCenterWidth * Math.cos(toRadians(toeIn)));
    const extensionGripToPadDelta = round1(aeroPadCenterWidth - aeroExtensionGripWidth);

    return {
      core: {
        saddleHeight: { value: saddleHeight, unit: 'cm', label: 'Saddle Height (BB to Saddle Center)', note: 'Distance from bottom bracket center to saddle midpoint' },
        jointWidth: { value: jointWidth, unit: 'cm', label: 'Dynamic Joint Center Width', note: 'Accounts for scapular protraction in riding posture' },
        scapularDelta: { value: scapularDelta, unit: 'cm', label: 'Scapular Protraction Delta', note: 'Reduction in shoulder width when leaning forward' },
        elbowShearWarning: { value: elbowShearWarning, unit: 'status', label: 'Elbow Shear Warning', note: 'Flags shear stress on inner elbow joint' }
      },
      road: {
        roadHBReach: { value: roadHBReach, unit: 'cm', label: 'Road Handlebar Reach', note: 'Saddle tip to handlebar center horizontal distance' },
        roadHBDrop: { value: roadHBDrop, unit: 'cm', label: 'Road Handlebar Drop', note: 'Saddle top to handlebar center vertical drop' },
        roadGripReachHoods: { value: roadGripReachHoods, unit: 'cm', label: 'Road Grip Reach (Hoods)', note: 'Horizontal reach from saddle tip to hood trough' },
        bbToHoodGripReach: { value: bbToHoodGripReach, unit: 'cm', label: 'BB to Hood Grip Reach', note: 'Horizontal reach from BB center to hood trough' },
        roadGripDrop: { value: roadGripDrop, unit: 'cm', label: 'Road Grip Drop', note: 'Vertical drop from saddle top to hood trough' }
      },
      tri: {
        aeroPadReach: { value: aeroPadReach, unit: 'cm', label: 'Aero Pad Reach', note: 'Horizontal distance from saddle tip to back edge of pad' },
        aeroPadDrop: { value: aeroPadDrop, unit: 'cm', label: 'Aero Pad Drop', note: 'Vertical drop from saddle top to top surface of arm pad' },
        armPadStackBB: { value: armPadStackBB, unit: 'cm', label: 'Arm Pad Stack (BB)', note: 'Vertical distance from BB center to top surface of pad' },
        armPadReachBB: { value: armPadReachBB, unit: 'cm', label: 'Arm Pad Reach (BB)', note: 'Horizontal distance from BB center to back edge of pad' },
        armPadToGripReach: { value: armPadToGripReach, unit: 'cm', label: 'Arm Pad to Grip Reach', note: 'Horizontal distance from back of pad to end of extension grip' },
        triTTGripReach: { value: triTTGripReach, unit: 'cm', label: 'Tri TT Grip Reach', note: 'Total horizontal reach from saddle tip to end of extension grip' },
        extensionGripAngle: { value: extensionGripAngle, unit: 'deg', label: 'Extension Grip Angle', note: 'High-hands tilt angle relative to horizontal' }
      },
      recommended: {
        roadBikeHandlebarWidth: { value: roadBikeHandlebarWidth, unit: 'cm', label: 'Road Bike Handlebar Width (Hoods)', note: 'Target hood-to-hood width matching protracted shoulders' },
        roadBikeDropFlareWidth: { value: roadBikeDropFlareWidth, unit: 'cm', label: 'Road Bike Drop Flare Width', note: 'Target width at the lower drop grips' },
        aeroPadCenterWidth: { value: aeroPadCenterWidth, unit: 'cm', label: 'Aero Pad Center-to-Center Width (W_pad)', note: 'Target pad spacing for neutral joint loading' },
        aeroExtensionGripWidth: { value: aeroExtensionGripWidth, unit: 'cm', label: 'Aero Extension Grip Width (W_grip)', note: 'Extension grip width creating front aerodynamic wedge' },
        extensionGripToPadDelta: { value: extensionGripToPadDelta, unit: 'cm', label: 'Extension Grip-to-Pad Delta', note: 'Subtle V-shape toe-in offset delta' }
      }
    };
  }

  /**
   * Helper to get values formatted in standard mm for PDF exports.
   */
  function computeBikeFitMM(inputs) {
    const raw = computeBikeFit(inputs);
    const toMM = function(cmVal) { return Math.round(cmVal * 10); };

    return {
      padStackMm: toMM(raw.tri.armPadStackBB.value),
      padReachMm: toMM(raw.tri.armPadReachBB.value),
      saddleHeightMm: toMM(raw.core.saddleHeight.value),
      wPadMm: toMM(raw.recommended.aeroPadCenterWidth.value),
      wGripMm: toMM(raw.recommended.aeroExtensionGripWidth.value),
      raw: raw
    };
  }

  const api = {
    computeBikeFit: computeBikeFit,
    computeBikeFitMM: computeBikeFitMM
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.BikeFitCalc = api;
  }
})(typeof window !== 'undefined' ? window : this);
