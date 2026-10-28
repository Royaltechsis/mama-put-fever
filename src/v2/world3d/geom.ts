// The 3D dining room is drawn with an orthographic camera tilted down by PITCH, so a world point maps to the
// stage (844 x 390) with plain arithmetic. The 2D overlays (order bubbles, drop zones, coins) use proj() to sit on
// the right spot, and the kitchen below the room keeps its 2D UI.
const STAGE_W = 844;
export const PPM = 56; // plan px per world metre: seat, table and staff positions are authored in these px
export const ZPX = 58; // stage px per world metre when drawn (the camera zoom)
export const PITCH = (34 * Math.PI) / 180; // camera pitch down from horizontal
export const COS = Math.cos(PITCH);
export const SIN = Math.sin(PITCH);
export const CANVAS_H = 240; // stage px used by the 3D room, the counter and kitchen start below it
export const TARGET = { x: 0, y: 0, z: -1.53 }; // world point at the centre of the canvas

/** world (X right, Y up, Z toward the viewer) -> stage px */
export const proj = (X: number, Y: number, Z: number) => ({
  x: STAGE_W / 2 + ZPX * (X - TARGET.x),
  y: CANVAS_H / 2 - ZPX * ((Y - TARGET.y) * COS - (Z - TARGET.z) * SIN),
});
export const X_OF = (stageX: number) => (stageX - STAGE_W / 2) / PPM;
export const STAGE_X = (X: number) => STAGE_W / 2 + X * PPM;

// Staff movement logic works in "stage-ish" coordinates: x in px, y is a depth value. These map them to the floor.
export const LANE = 164; // y of the lane in front of the tables
export const AISLE_Y = 136; // y beside a table
export const KL = 222; // y used for cooks, who work behind the pass counter
export const Z_LANE = 1.8;
export const Z_AISLE = 0.2;
export const yToZ = (y: number) => Z_LANE + (y - LANE) * ((Z_AISLE - Z_LANE) / (AISLE_Y - LANE));

// room layout (metres)
export const Z_WALL = -2.25;
export const Z_BACK = -1.45; // walkway behind the chairs, where customers come in from the door
export const Z_SEAT = -0.85;
export const Z_TABLE = 0;
export const DOOR_X = -9; // customers enter from the left, offscreen
export const PASS_X = 5.9; // the pass counter along the right wall
export const CHEF_X = 6.7; // cooks stand behind it
export const PASS_STAND_X = 5.0; // where waiters pick plates up, stage px = STAGE_X(5.6)
export const kitchenZ = (kx: number) => -1.2 + (kx / STAGE_W) * 3.0; // kitchen lane x (0..844) -> position along the pass
