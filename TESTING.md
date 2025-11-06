# Testing Guide for Collaborative Drawing Canvas

This document provides comprehensive testing procedures to verify all functionality of the application.

## Test Environment Setup

### Prerequisites
- Node.js and npm installed
- 2-3 browser instances (Chrome, Firefox, Safari, or Edge)
- Server running on localhost:3000
- Developer Tools (F12) available

### Starting the Server
```bash
npm install
npm start
```

Server should display:
```
Server is running on http://localhost:3000
WebSocket server is running on ws://localhost:3000
```

---

## Unit Test Scenarios

### 1. Canvas Drawing Operations

#### Test 1.1: Brush Tool Basic Drawing
**Objective:** Verify brush draws on canvas correctly

**Steps:**
1. Open http://localhost:3000
2. "Brush" tool is selected by default
3. Click and drag on canvas to draw
4. Observe smooth line appears

**Expected Result:**
- Smooth, continuous line follows mouse movement
- Line has default black color
- Line width is 5px

**Pass/Fail:** ___

#### Test 1.2: Color Selection
**Objective:** Verify color picker and preset colors work

**Steps:**
1. Click red color button in palette
2. Draw a line on canvas
3. Click color picker input
4. Select different color (e.g., blue)
5. Draw another line

**Expected Result:**
- First line is red
- Second line is blue
- Color picker shows selected color
- All preset colors selectable

**Pass/Fail:** ___

#### Test 1.3: Stroke Width Adjustment
**Objective:** Verify stroke width slider works

**Steps:**
1. Set size slider to 2px
2. Draw a thin line
3. Set size slider to 50px
4. Draw a thick line
5. Observe display shows current size

**Expected Result:**
- Thin line is noticeably thinner
- Thick line is noticeably thicker
- Size display updates
- Size range 1-50px works

**Pass/Fail:** ___

#### Test 1.4: Eraser Tool
**Objective:** Verify eraser removes content

**Steps:**
1. Draw a black line with brush
2. Select "Eraser" tool
3. Click on brush tool button again (switch back)
4. Click eraser tool
5. Click and drag over drawn line

**Expected Result:**
- Erased area becomes white/transparent
- Eraser size can be adjusted like brush
- Switching tools works correctly

**Pass/Fail:** ___

---

### 2. Undo/Redo Operations

#### Test 2.1: Basic Undo
**Objective:** Verify undo removes last action

**Steps:**
1. Draw a line
2. Click "Undo" button or press Ctrl+Z
3. Observe canvas

**Expected Result:**
- Line disappears from canvas
- Canvas returns to previous state
- Button disabled after returning to initial state

**Pass/Fail:** ___

#### Test 2.2: Multiple Undo
**Objective:** Verify can undo multiple actions

**Steps:**
1. Draw line 1
2. Draw line 2
3. Draw line 3
4. Click "Undo" 3 times
5. Canvas should be empty

**Expected Result:**
- Canvas clears after 3 undos
- Can undo all the way to empty canvas
- Undo button disabled at initial state

**Pass/Fail:** ___

#### Test 2.3: Basic Redo
**Objective:** Verify redo restores action

**Steps:**
1. Draw a line
2. Press Ctrl+Z (undo)
3. Press Ctrl+Y or click "Redo"
4. Line reappears

**Expected Result:**
- Line reappears exactly as before
- Can redo up to last undone action
- Redo button disabled when at latest state

**Pass/Fail:** ___

#### Test 2.4: Undo-Redo Cycle
**Objective:** Verify undo/redo cycle works

**Steps:**
1. Draw line 1
2. Draw line 2
3. Draw line 3
4. Undo (removes line 3)
5. Redo (restores line 3)
6. Undo (removes line 3 again)
7. Draw new line 4
8. Verify redo is disabled

**Expected Result:**
- Undo/redo cycle works smoothly
- New drawing after undo clears redo history
- Buttons enable/disable appropriately

**Pass/Fail:** ___

---

### 3. Clear Canvas

#### Test 3.1: Clear Canvas
**Objective:** Verify clear clears entire canvas

**Steps:**
1. Draw multiple lines/scribbles
2. Click "Clear" button
3. Confirm the dialog
4. Observe canvas

**Expected Result:**
- Dialog appears asking for confirmation
- Canvas becomes completely empty
- Clear can be undone with Ctrl+Z

**Pass/Fail:** ___

#### Test 3.2: Clear Dialog Cancellation
**Objective:** Verify cancel in clear dialog

**Steps:**
1. Draw a line
2. Click "Clear" button
3. Click "Cancel" in dialog

**Expected Result:**
- Canvas not cleared
- Drawing remains intact
- Dialog closes

**Pass/Fail:** ___

---

## Integration Test Scenarios

### 4. Real-Time Synchronization (Multi-User)

#### Test 4.1: Two Users Drawing Sequentially
**Objective:** Verify User B sees User A's drawings in real-time

**Setup:** Open 2 browser tabs (Tab A and Tab B)

**Steps:**
1. In Tab A, draw a horizontal line
2. Immediately observe Tab B
3. In Tab B, draw a vertical line
4. Immediately observe Tab A

**Expected Result:**
- Tab B shows Tab A's line immediately (within 100ms)
- Tab A shows Tab B's line immediately
- Both users see identical canvas

**Pass/Fail:** ___

#### Test 4.2: Simultaneous Drawing
**Objective:** Verify concurrent drawing is handled correctly

**Setup:** Open 2 browser tabs

**Steps:**
1. In Tab A, start drawing
2. While Tab A is still drawing, draw in Tab B
3. Complete both drawings
4. Verify both canvases match

**Expected Result:**
- Both lines appear on both canvases
- No visual corruption
- Lines may overlap naturally

**Pass/Fail:** ___

#### Test 4.3: Color Differentiation
**Objective:** Verify users are distinguished by color

**Setup:** Open 2 browser tabs

**Steps:**
1. In Tab A, draw with blue color
2. In Tab B, observe user color in users list
3. In Tab A, observe Tab B's user color

**Expected Result:**
- Each user has unique color in users list
- Cursor indicators show user colors
- Different colors for each user

**Pass/Fail:** ___

---

### 5. Undo/Redo Synchronization

#### Test 5.1: Undo Propagates to Others
**Objective:** Verify when one user undoes, others see the change

**Setup:** Open 2 browser tabs

**Steps:**
1. In Tab A, draw a red line
2. In Tab B, verify line appears
3. In Tab A, press Ctrl+Z to undo
4. Immediately observe Tab B

**Expected Result:**
- Tab B's line disappears when Tab A undoes
- Both canvases are identical after undo
- Synchronization is immediate

**Pass/Fail:** ___

#### Test 5.2: Redo Propagates to Others
**Objective:** Verify when one user redoes, others see the change

**Setup:** Open 2 browser tabs with undo scenario from Test 5.1

**Steps:**
1. In Tab A, press Ctrl+Y to redo (line reappears)
2. Immediately observe Tab B

**Expected Result:**
- Tab B's line reappears
- Both canvases are identical
- Synchronization is immediate

**Pass/Fail:** ___

#### Test 5.3: Undo During Concurrent Drawing
**Objective:** Verify undo doesn't break concurrent operations

**Setup:** Open 2 browser tabs

**Steps:**
1. In Tab A, draw line 1
2. In Tab B, draw line 2
3. In Tab A, undo (should remove line 1)
4. In Tab B, draw line 3
5. Compare canvases

**Expected Result:**
- Tab A shows: line 2, line 3
- Tab B shows: line 2, line 3
- Lines from both users visible
- No visual corruption

**Pass/Fail:** ___

---

### 6. Clear Canvas Synchronization

#### Test 6.1: Clear Propagates to Others
**Objective:** Verify clear is seen by all users

**Setup:** Open 2 browser tabs

**Steps:**
1. In both tabs, draw some lines
2. In Tab A, click "Clear" and confirm
3. Immediately observe Tab B

**Expected Result:**
- Tab B's canvas clears immediately
- Both canvases are empty
- Synchronization is instant

**Pass/Fail:** ___

---

### 7. User Management

#### Test 7.1: User Joins
**Objective:** Verify new user can join and see existing canvas

**Setup:** Open 1 browser tab (Tab A)

**Steps:**
1. In Tab A, draw some lines and shapes
2. Open new tab (Tab B)
3. Navigate to http://localhost:3000
4. Observe Tab B's users list

**Expected Result:**
- Tab B shows existing canvas (same as Tab A)
- Tab B shows Tab A's user in users list
- Tab A's users list updates to show Tab B's user

**Pass/Fail:** ___

#### Test 7.2: User Leaves
**Objective:** Verify users list updates when user disconnects

**Setup:** Open 2 browser tabs

**Steps:**
1. Verify both users in each tab's users list
2. Close Tab B (or disconnect)
3. Observe Tab A's users list

**Expected Result:**
- Tab A's users list no longer shows Tab B's user
- No console errors
- Graceful disconnection

**Pass/Fail:** ___

#### Test 7.3: Late Joiner Sees Canvas History
**Objective:** Verify late joiner can see what others drew

**Setup:** Prepared canvas with drawings

**Steps:**
1. In Tab A, draw: 1. red line, 2. blue square, 3. green circle
4. Open new Tab B
5. Navigate to http://localhost:3000
6. Observe canvas state

**Expected Result:**
- Tab B shows all 3 drawings
- Drawings are in correct positions
- Colors are correct
- Canvas state matches Tab A

**Pass/Fail:** ___

---

### 8. Cursor Position Tracking

#### Test 8.1: Remote Cursor Visible
**Objective:** Verify remote user's cursor is visible

**Setup:** Open 2 browser tabs

**Steps:**
1. In Tab A, move mouse over canvas
2. Observe Tab B
3. Move mouse to different positions in Tab A

**Expected Result:**
- Circle cursor appears in Tab B
- Cursor follows mouse movements in Tab A
- Cursor disappears when mouse leaves canvas

**Pass/Fail:** ___

#### Test 8.2: Cursor Label
**Objective:** Verify cursor label shows user ID

**Setup:** Open 2 browser tabs

**Steps:**
1. In Tab A, move mouse over canvas
2. Observe cursor in Tab B
3. Hover over the remote cursor

**Expected Result:**
- Cursor has label with user identifier
- Label visible when cursor is on canvas
- Label color matches user's color

**Pass/Fail:** ___

---

## Connection and Reliability Tests

### 9. Connection Status

#### Test 9.1: Connected State
**Objective:** Verify connection indicator shows connected

**Steps:**
1. Open application
2. Wait for connection
3. Observe status indicator

**Expected Result:**
- Green "Connected" indicator appears
- Status text shows "Connected"
- No error messages in console

**Pass/Fail:** ___

#### Test 9.2: Reconnection
**Objective:** Verify automatic reconnection works

**Setup:** Chrome DevTools Network throttling

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Toggle offline mode ON
4. Try to draw (observe status)
5. Toggle offline mode OFF
6. Observe reconnection

**Expected Result:**
- Status shows "Disconnected" when offline
- Status shows "Connecting..." during reconnection
- Automatically reconnects when back online
- Queued drawing events are sent

**Pass/Fail:** ___

#### Test 9.3: Latency Display
**Objective:** Verify latency is displayed correctly

**Steps:**
1. Open application
2. Observe latency display in bottom right
3. Check that it updates periodically

**Expected Result:**
- Latency display shows millisecond value
- Updates every 5 seconds
- Value is reasonable (< 100ms for localhost)

**Pass/Fail:** ___

---

### 10. Error Handling

#### Test 10.1: Invalid Color Input
**Objective:** Verify invalid input doesn't crash app

**Steps:**
1. Try to enter invalid color in color picker
2. Attempt to draw with invalid state
3. Observe application

**Expected Result:**
- No crash
- Application continues to work
- Falls back to default color or ignores invalid input

**Pass/Fail:** ___

#### Test 10.2: Server Disconnect and Reconnect
**Objective:** Verify graceful handling of server disconnect

**Setup:** Server running

**Steps:**
1. Open application, verify connected
2. Stop server (Ctrl+C)
3. Observe application behavior
4. Restart server
5. Observe reconnection

**Expected Result:**
- Status indicator turns red
- Status shows "Disconnected"
- Reconnection attempted automatically
- When server restarts, status turns green
- Application fully functional again

**Pass/Fail:** ___

---

## Performance Tests

### 11. Load Testing

#### Test 11.1: Heavy Drawing
**Objective:** Verify performance with heavy drawing

**Steps:**
1. Rapidly draw across entire canvas
2. Create 20+ continuous strokes
3. Observe performance

**Expected Result:**
- No significant lag
- Drawing appears smooth
- Frame rate remains acceptable
- No memory leak

**Pass/Fail:** ___

#### Test 11.2: Multiple Users Under Load
**Objective:** Verify performance with 3 concurrent users

**Setup:** Open 3 browser tabs

**Steps:**
1. In Tab A, draw continuously
2. Simultaneously in Tab B, draw
3. Simultaneously in Tab C, draw
4. Continue for 30 seconds
5. Observe latency and smoothness

**Expected Result:**
- All tabs remain responsive
- Drawings appear with minimal latency
- No visual corruption
- No crashes

**Pass/Fail:** ___

#### Test 11.3: Undo/Redo Performance
**Objective:** Verify undo/redo is fast

**Steps:**
1. Create 50 drawing actions
2. Rapidly click Undo 10 times
3. Rapidly click Redo 10 times
4. Measure time and smoothness

**Expected Result:**
- Canvas updates quickly
- No lag or stuttering
- Completes in < 1 second for 10 operations

**Pass/Fail:** ___

---

## Browser Compatibility Tests

### 12. Browser Testing

Test each scenario in the following browsers:

| Browser | Version | Drawing | Sync | Undo | Status |
|---------|---------|---------|------|------|--------|
| Chrome | Latest | ___ | ___ | ___ | |
| Firefox | Latest | ___ | ___ | ___ | |
| Safari | Latest | ___ | ___ | ___ | |
| Edge | Latest | ___ | ___ | ___ | |

---

## Mobile Testing

### 13. Touch Support

#### Test 13.1: Touch Drawing
**Objective:** Verify touch drawing works on mobile

**Setup:** Device with touch screen or DevTools mobile emulation

**Steps:**
1. Open app on mobile device
2. Touch and drag on canvas
3. Use two fingers (if supported)
4. Try different tools

**Expected Result:**
- Drawing works with touch input
- Multi-touch handled gracefully
- Responsive and smooth

**Pass/Fail:** ___

---

## Test Results Summary

### Functional Tests
- Canvas Operations: ___/4
- Undo/Redo: ___/4
- Clear Canvas: ___/2
- Real-Time Sync: ___/3
- Undo/Redo Sync: ___/3
- Clear Sync: ___/1
- User Management: ___/3
- Cursor Tracking: ___/2

**Total Functional: ___/25**

### Connection Tests
- Connection Status: ___/3
- Error Handling: ___/2

**Total Reliability: ___/5**

### Performance Tests
- Load Testing: ___/3

**Total Performance: ___/3**

### Browser Compatibility
- Chrome: ___/3
- Firefox: ___/3
- Safari: ___/3
- Edge: ___/3

**Total Compatibility: ___/12**

---

## Overall Test Result

**Total Tests Passed: ___/48**

**Pass Rate: ___%**

**Status:** ☐ PASS ☐ FAIL ☐ NEEDS FIXES

---

## Known Issues Found During Testing

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

---

## Notes and Observations

___________________________________________________________
___________________________________________________________
___________________________________________________________

---

**Test Date:** ____________
**Tester:** ____________
**Approved:** ____________
