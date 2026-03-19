// A4 dimensions in points (1 point = 1/72 inch)
export const A4_WIDTH = 595.28
export const A4_HEIGHT = 841.89

// Margins
export const MARGIN_LEFT = 60
export const MARGIN_RIGHT = 60
export const MARGIN_TOP = 50

// Content width
export const CONTENT_WIDTH = A4_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

// Font sizes
export const FONT_SIZE_TITLE = 16
export const FONT_SIZE_NORMAL = 9.5
export const FONT_SIZE_SMALL = 8
export const FONT_SIZE_LABEL = 7.5

// Line heights
export const LINE_HEIGHT = 14
export const LINE_HEIGHT_SMALL = 11

// Table column positions (from left margin)
export const TABLE_COL_POS = MARGIN_LEFT
export const TABLE_COL_QTY = 300
export const TABLE_COL_PRICE = 355
export const TABLE_COL_VAT = 420
export const TABLE_COL_AMOUNT = A4_WIDTH - MARGIN_RIGHT

// QR bill starts at 105mm from bottom = ~297mm from top
// SwissQRBill handles this automatically
