import type { LowLevelNWCTXTFile } from "./lowlevel";

export interface NWCTXTPosition {
  accidental: string | null;
  position: number;
  head: string;
  tie: boolean;
}

export interface NWCTXTDuration {
  Dur: string;
}

export interface NWCTXTLyrics {
  Text?: string;
}

export interface NWCTXTBaseMusicItem {
  name: string;
  fields: Record<string, any>;
}

export interface NWCTXTNote {
  name: "Note";
  fields: {
    Pos?: NWCTXTPosition;
    Dur?: NWCTXTDuration;
  };
}

export interface NWCTXTRest {
  name: "Rest";
  fields: {
    Dur?: NWCTXTDuration;
  };
}

export interface NWCTXTBar {
  name: "Bar";
  fields: Record<string, any>;
}

export interface NWCTXTChord {
  name: "Chord";
  fields: {
    Pos?: NWCTXTPosition[];
    Dur?: NWCTXTDuration;
    Pos2?: NWCTXTPosition[];
    Dur2?: string;
  };
}

export interface NWCTXTKey {
  name: "Key";
  fields: {
    /**
     * @example "F#"
     */
    Signature?: string[];
    /**
     * @example "G"
     */
    Tonic?: string;
  };
}

export interface NWCTXTClef {
  name: "Clef";
  fields: {
    /**
     * @example "Treble"
     * @example "Bass"
     */
    Type?: string;
    /**
     * @example "Octave Down"
     */
    OctaveShift?: string;
  };
}

export interface NWCTXTTimeSig {
  name: "TimeSig";
  fields: {
    Signature?: string;
  };
}

export interface NWCTXTTempo {
  name: "Tempo";
  fields: {
    /**
     * @example "Half"
     */
    Base?: string;
    /**
     * @example 52
     */
    Tempo?: number;
    Pos?: number;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
  };
}

export interface NWCTXTSustainPedal {
  name: "SustainPedal";
  fields: {
    /**
     * @example -16
     */
    Pos?: number;
    /**
     * @example true
     */
    Wide?: boolean;
  };
}

export interface NWCTXTUser {
  name: "User";
  fields: {
    ""?: string;
  };
}

export interface NWCTXTMPC {
  name: "MPC";
  fields: Record<string, any>;
}

export interface NWCTXTText {
  name: "Text";
  fields: Record<string, any>;
}

export interface NWCTXTEnding {
  name: "Ending";
  fields: Record<string, any>;
}

export interface NWCTXTFlow {
  name: "Flow";
  fields: Record<string, any>;
}

export interface NWCTXTTempoVariance {
  name: "TempoVariance";
  fields: Record<string, any>;
}

export interface NWCTXTInstrument {
  name: "Instrument";
  fields: Record<string, any>;
}

export interface NWCTXTRestChord {
  name: "RestChord";
  fields: Record<string, any>;
}

export interface NWCTXTPerformanceStyle {
  name: "PerformanceStyle";
  fields: Record<string, any>;
}

export interface NWCTXTDynamic {
  name: "Dynamic";
  fields: Record<string, any>;
}

export type NWCTXTMusicItem =
  | NWCTXTBar
  | NWCTXTChord
  | NWCTXTClef
  | NWCTXTDynamic
  | NWCTXTEnding
  | NWCTXTFlow
  | NWCTXTInstrument
  | NWCTXTKey
  | NWCTXTMPC
  | NWCTXTNote
  | NWCTXTPerformanceStyle
  | NWCTXTRest
  | NWCTXTSustainPedal
  | NWCTXTTempo
  | NWCTXTRestChord
  | NWCTXTTempoVariance
  | NWCTXTText
  | NWCTXTTimeSig
  | NWCTXTUser;

export interface NWCTXTStaff {
  properties: {
    AddStaff?: {
      /**
       * @example "Standard"
       */
      Group?: string;

      /**
       * @example "Standard"
       */
      Name?: string;
    };

    Lyrics?: {
      /**
       * @example "Standard Rules"
       */
      Align?: string;

      /**
       * @example 0
       */
      Offset?: number;

      /**
       * @example "Bottom"
       */
      Placement?: string;
    };

    StaffInstrument?: {
      /**
       * @example "10,30,45,60,75,92,108,127"
       */
      DynVel?: string;

      /**
       * @example 0
       */
      Trans?: number;
    };

    StaffProperties?: {
      /**
       * @example 16
       */
      BoundaryBottom?: number;

      /**
       * @example 12
       */
      BoundaryTop?: number;

      /**
       * @example 1
       */
      Channel?: number;

      /**
       * @example "Default"
       */
      Color?: string;

      /**
       * @example 0
       */
      Device?: number;

      /**
       * @example "Section Close"
       */
      EndingBar?: string;

      /**
       * @example 5
       */
      Lines?: number;

      /**
       * @example false
       */
      Muted?: boolean;

      /**
       * @example 64
       */
      StereoPan?: number;

      /**
       * @example true
       */
      Visible?: boolean;

      /**
       * @example number
       */
      Volume?: number;
    };
  };
  music: NWCTXTMusicItem[];
  lyrics: NWCTXTLyrics[];
}

export interface NWCTXTFontConfig {
  /**
   * @example true
   */
  Bold: boolean;

  /**
   * @example 0
   */
  CharSet: number;

  /**
   * @example true
   */
  Italic: boolean;

  /**
   * @example 10
   */
  Size: number;

  /**
   * @example "Times New Roman"
   */
  Typeface: string;
}

export interface NWCTXTFile extends Pick<LowLevelNWCTXTFile, "version" | "clip" | "extra"> {
  fonts: Partial<
    Record<
      | "PageSmallText"
      | "PageText"
      | "PageTitleText"
      | "StaffBold"
      | "StaffItalic"
      | "StaffLyric"
      | "User1"
      | "User2"
      | "User3"
      | "User4"
      | "User5"
      | "User6",
      NWCTXTFontConfig
    >
  >;
  properties: {
    Editor?: {
      ActiveStaff?: number;
      CaretIndex?: number;
      CaretPos?: number;
    };
    PgMargins?: {
      Bottom?: number;
      Left?: number;
      Mirror?: boolean;
      Right?: number;
      Top?: number;
    };
    PgSetup?: {
      AllowLayering?: boolean;
      BarNumbers?: string;
      DurationPadding?: boolean;
      ExtendLastSystem?: boolean;
      JustifyVertically?: boolean;
      PageNumbers?: number;
      PrintSystemSepMark?: boolean;
      StaffLabels?: string;
      StaffSize?: number;
      StartingBar?: number;
      TitlePage?: boolean;
      Zoom?: number;
    };
    SongInfo?: {
      Author?: string;
      Comments?: string;
      Copyright1?: string;
      Copyright2?: string;
      Lyricist?: string;
      Title?: string;
    };
  };
  staffs: NWCTXTStaff[];
}
