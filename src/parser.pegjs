/*
 * MIT License
 *
 * Copyright (c) 2016 DivDE <divde@laposte.net>
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

{
  function notNull(param) {
    return !!param;
  }
}

start
  = commentLine * begin:begin lines:(dataLine / commentLine / newLine) * end:end (commentLine / newLine) * { if (begin.clip !== end.clip) {throw new Error("Invalid line.")} begin.content = lines.filter(notNull); return begin }

begin
  = "!NoteWorthyComposer" clip:"Clip"? "(" version:$([0-9]+ "." [0-9]+) extra:("," extra:$([^)]+) { return extra })? ")" newLine { return {version: version, clip: !!clip, extra: extra} }

end
  = "!NoteWorthyComposer" clip:"Clip"? "-End" newLine { return {clip: !!clip} }

commentLine
  = "#" content:$([^\n\r] *) newLine {}

dataLine
  = "|" name:identifier params:(param *) newLine { return { name: name, params: params } }

param
  = "|" name:(name:identifier ":" { return name })? param:paramValue { param.name = name; return param }

paramValue
  = quotedParam / unquotedParam

quotedParam
  = '"' chars:(charInQuotedString *) '"' { return { quoted: true, value: chars.join('') } }

charInQuotedString
  = char:[^"\\] { return char }
  / "\\r" { return "\r" }
  / "\\\"" { return "\"" }
  / "\\'" { return "'" }
  / "\\n" { return "\n" }
  / "\\\\" { return "\\" }

unquotedParam
  = param: $ ([^"\n\r|] *) { return { quoted: false, value: param } }

identifier
  = $ ([a-zA-Z0-9] +)

newLine
  = "\r"? "\n" "\r"? {}
