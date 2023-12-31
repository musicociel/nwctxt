/*
 * MIT License
 *
 * Copyright (c) 2023 DivDE <divde@musicociel.fr>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export const fieldsByInstruction = new Map<string, Map<string, Set<any>>>();

const lyricN = /^Lyric\d+$/;

export const getInstructionKey = (instruction: { name: string }) => {
  let instructionKey = instruction.name;
  if (lyricN.test(instructionKey)) {
    instructionKey = "Lyric1";
  }
  return instructionKey;
};

export const createProcessInstruction =
  <I extends { name: string }, T extends any[], R>(
    instructionsMap: Record<string, (instruction: I, ...args: T) => R>,
    defaultProcessInstruction: (instruction: I, ...args: T) => R
  ) =>
  (instruction: I, ...args: T) => {
    const fn = instructionsMap[getInstructionKey(instruction)] || defaultProcessInstruction;
    return fn(instruction, ...args);
  };

export const createProcessField =
  <I extends { name: string }, F extends { name: string }, T extends any[], R>(
    fieldsMap: Record<string, (instruction: I, field: F, ...args: T) => R>,
    defaultProcessField: (instruction: I, field: F, ...args: T) => R,
    record = false
  ) =>
  (instruction: I, field: F, ...args: T): R => {
    const fieldName = field.name;
    const fn = fieldsMap[`${getInstructionKey(instruction)}|${fieldName}`] || fieldsMap[fieldName] || defaultProcessField;
    const res = fn(instruction, field, ...args);
    if (record) {
      const instrKey = getInstructionKey(instruction);
      let m = fieldsByInstruction.get(instrKey);
      if (!m) {
        m = new Map();
        fieldsByInstruction.set(instrKey, m);
      }
      let s = m.get(fieldName);
      if (!s) {
        s = new Set();
        m.set(fieldName, s);
      }
      s.add(JSON.stringify(res));
    }
    return res;
  };
