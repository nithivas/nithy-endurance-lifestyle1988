/**
 * bikefit-calc.js
 * Shared Endurance Squad bike fit formula module.
 * Ported 1:1 from the biomechanical cockpit calculator spreadsheet.
 * Supports Node.js, ES6 imports, and direct browser global usage.
 * 
 * NOTE: All length measurements, inputs, and outputs are strictly normalized to MILLIMETERS (mm).
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
   * @param {number} inputs.inseam            Rider Inseam (mm)
   * @param {number} [inputs.crank=165]       Crank Length (mm) - reference
   * @param {number} inputs.torso             Torso Length (mm)
   * @param {number} inputs.armLength         Arm Length (mm)
   * @param {number} inputs.forearm           Forearm Length (mm)
   * @param {number} inputs.staticAcromion    Static Acromion Width, W_static (mm)
   * @param {number} inputs.elbowFlare        Elbow Flare Width, W_elbow (mm)
   * @param {'Comfort'|'Medium'|'Aggressive'} [inputs.aeroAggressiveness='Medium']
   * @param {number} [inputs.toeIn=12]        Wrist Extension Toe-In (degrees)
   * @param {number} inputs.frameStack        Frame Stack, BB to headtube top (mm)
   * @param {number} inputs.frameReach        Frame Reach, BB to headtube top (mm)
   * @param {number} inputs.stemLength        Stem Length (mm)
   * @param {number} inputs.barReach          Handlebar Bar Reach (mm)
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
    const elbowShearWarning = elbowShearDelta > 30 ? 'HIGH TORQUE – Narrow Cockpit' : 'OPTIMAL';

    // ---- ROAD COCKPIT ----
    const roadHBReach = round1(torso * 0.45 + armLength * 0.35);
    const roadHBDrop = -65; // Fixed reference value in mm (-6.5 cm)
    const roadGripReachHoods = round1(roadHBReach + barReach);
    const bbToHoodGripReach = round1(frameReach + stemLength + barReach);
    const roadGripDrop = round1(roadHBDrop - 10); // Offset by -10 mm (-1.0 cm)

    // ---- TRIATHLON / TT COCKPIT ----
    const aeroPadReach = round1(forearm * 1.33);
    const aeroPadDrop = -81; // Fixed reference value in mm (-8.1 cm)
    const armPadStackBB = round1(saddleHeight + 145); // Offset by 145 mm (+14.5 cm)
    const armPadReachBB = round1(frameReach + stemLength - 67); // Offset by -67 mm (-6.7 cm)
    const armPadToGripReach = round1(forearm - 10); // Offset by -10 mm (-1.0 cm)
    const triTTGripReach = round1(aeroPadReach + armPadToGripReach);
    const extensionGripAngle = 15; // Fixed reference value in degrees

    // ---- RECOMMENDED OUTPUTS ----
    const roadBikeHandlebarWidth = jointWidth <= 390 ? 380 : 400; // Threshold 390 mm; targets 380 mm / 400 mm
    const roadBikeDropFlareWidth = roadBikeHandlebarWidth + 20; // +20 mm flare offset (+2 cm)

    const padFactor = aeroAggressiveness === 'Aggressive' ? 0.35
      : aeroAggressiveness === 'Comfort' ? 0.45
      : 0.40; // Medium default

    const aeroPadCenterWidth = round1(jointWidth * padFactor);
    const aeroExtensionGripWidth = round1(aeroPadCenterWidth * Math.cos(toRadians(toeIn)));
    const extensionGripToPadDelta = round1(aeroPadCenterWidth - aeroExtensionGripWidth);

    return {
      core: {
        saddleHeight: { value: saddleHeight, unit: 'mm', label: 'Saddle Height (BB to Saddle Center)', note: 'Distance from bottom bracket center to saddle midpoint' },
        jointWidth: { value: jointWidth, unit: 'mm', label: 'Dynamic Joint Center Width', note: 'Accounts for scapular protraction in riding posture' },
        scapularDelta: { value: scapularDelta, unit: 'mm', label: 'Scapular Protraction Delta', note: 'Reduction in shoulder width when leaning forward' },
        elbowShearWarning: { value: elbowShearWarning, unit: 'status', label: 'Elbow Shear Warning', note: 'Flags shear stress on inner elbow joint' }
      },
      road: {
        roadHBReach: { value: roadHBReach, unit: 'mm', label: 'Road Handlebar Reach', note: 'Saddle tip to handlebar center horizontal distance' },
        roadHBDrop: { value: roadHBDrop, unit: 'mm', label: 'Road Handlebar Drop', note: 'Saddle top to handlebar center vertical drop' },
        roadGripReachHoods: { value: roadGripReachHoods, unit: 'mm', label: 'Road Grip Reach (Hoods)', note: 'Horizontal reach from saddle tip to hood trough' },
        bbToHoodGripReach: { value: bbToHoodGripReach, unit: 'mm', label: 'BB to Hood Grip Reach', note: 'Horizontal reach from BB center to hood trough' },
        roadGripDrop: { value: roadGripDrop, unit: 'mm', label: 'Road Grip Drop', note: 'Vertical drop from saddle top to hood trough' }
      },
      tri: {
        aeroPadReach: { value: aeroPadReach, unit: 'mm', label: 'Aero Pad Reach', note: 'Horizontal distance from saddle tip to back edge of pad' },
        aeroPadDrop: { value: aeroPadDrop, unit: 'mm', label: 'Aero Pad Drop', note: 'Vertical drop from saddle top to top surface of arm pad' },
        armPadStackBB: { value: armPadStackBB, unit: 'mm', label: 'Arm Pad Stack (BB)', note: 'Vertical distance from BB center to top surface of pad' },
        armPadReachBB: { value: armPadReachBB, unit: 'mm', label: 'Arm Pad Reach (BB)', note: 'Horizontal distance from BB center to back edge of pad' },
        armPadToGripReach: { value: armPadToGripReach, unit: 'mm', label: 'Arm Pad to Grip Reach', note: 'Horizontal distance from back of pad to end of extension grip' },
        triTTGripReach: { value: triTTGripReach, unit: 'mm', label: 'Tri TT Grip Reach', note: 'Total horizontal reach from saddle tip to end of extension grip' },
        extensionGripAngle: { value: extensionGripAngle, unit: 'deg', label: 'Extension Grip Angle', note: 'High-hands tilt angle relative to horizontal' }
      },
      recommended: {
        roadBikeHandlebarWidth: { value: roadBikeHandlebarWidth, unit: 'mm', label: 'Road Bike Handlebar Width (Hoods)', note: 'Target hood-to-hood width matching protracted shoulders' },
        roadBikeDropFlareWidth: { value: roadBikeDropFlareWidth, unit: 'mm', label: 'Road Bike Drop Flare Width', note: 'Target width at the lower drop grips' },
        aeroPadCenterWidth: { value: aeroPadCenterWidth, unit: 'mm', label: 'Aero Pad Center-to-Center Width (W_pad)', note: 'Target pad spacing for neutral joint loading' },
        aeroExtensionGripWidth: { value: aeroExtensionGripWidth, unit: 'mm', label: 'Aero Extension Grip Width (W_grip)', note: 'Extension grip width creating front aerodynamic wedge' },
        extensionGripToPadDelta: { value: extensionGripToPadDelta, unit: 'mm', label: 'Extension Grip-to-Pad Delta', note: 'Subtle V-shape toe-in offset delta' }
      }
    };
  }

  /**
   * Helper to get values formatted in standard mm for PDF exports.
   */
  function computeBikeFitMM(inputs) {
    const raw = computeBikeFit(inputs);

    return {
      padStackMm: Math.round(raw.tri.armPadStackBB.value),
      padReachMm: Math.round(raw.tri.armPadReachBB.value),
      saddleHeightMm: Math.round(raw.core.saddleHeight.value),
      wPadMm: Math.round(raw.recommended.aeroPadCenterWidth.value),
      wGripMm: Math.round(raw.recommended.aeroExtensionGripWidth.value),
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
