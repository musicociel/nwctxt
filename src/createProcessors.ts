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

const lyricN = /^Lyric\d+$/;

export function getInstructionKey(instruction) {
  let instructionKey = instruction.name;
  if (lyricN.test(instructionKey)) {
    instructionKey = "Lyric1";
  }
  return instructionKey;
}

export function createProcessInstruction(instructionsMap, defaultProcessInstruction) {
  return function (instruction, ...args) {
    const fn = instructionsMap[getInstructionKey(instruction)] || defaultProcessInstruction;
    return fn(instruction, ...args);
  };
}

export function createProcessField(fieldsMap, defaultProcessField) {
  return function (instruction, field, ...args) {
    const fieldName = field.name;
    const fn = fieldsMap[`${getInstructionKey(instruction)}|${fieldName}`] || fieldsMap[fieldName] || defaultProcessField;
    return fn(instruction, field, ...args);
  };
}
