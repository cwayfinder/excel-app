import { isNumber } from './utils';

export type TokenType =
  'LPAREN' | 'RPAREN' | 'COMMA' |  // Single-character
  'FUNCVAR' | 'VALUE' |  // Entities
  'EOF';  // Misc


export class Token {
  type: TokenType;
  value: any;
  column: number;
  line: string;

  constructor(type: TokenType, value: any = '', column: number = -1, line: string = '') {
    this.type = type;
    this.column = column;
    this.line = line;

    // Check if value is boolean
    if (value.toLowerCase() === 'true') {
      this.value = true;
    } else if (value.toLowerCase() === 'false') {
      this.value = false;
    }

    // Check if value is array
    else if (value.startsWith('\[')) {
      this.value = JSON.parse(value.replace(/'/g, '"'));
    }

    // Check if value is number
    else if (isNumber(value)) {
      this.value = Number(value);
    }

    // Check if value is object
    else if (value.startsWith('\{')) {
      // Ensure that keys are quoted
      value = value.replace(/({|,) *(?:'|")?([\w\-]+)(?:'|")? *:/g, '$1 "$2": ');
      // Ensure that values are quoted
      value = value.replace(/: *(?:'|")?([^\{\}]+?)(?:'|")? *(,|})/g, ': "$1"$2');
      this.value = JSON.parse(value);
    }

    // Otherwise save value without quotes
    else {
      this.value = value.replace(/((^'|'$)|(?:^"|"$))/g, '');
    }
  }
}
