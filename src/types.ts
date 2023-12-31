import type { LowLevelNWCTXTFile } from "./lowlevel";

type AnyFields = { [name: string]: any };

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
  fields: AnyFields;
}

export interface NWCTXTNote {
  name: "Note";
  fields: AnyFields;
}

export interface NWCTXTRest {
  name: "Rest";
  fields: AnyFields;
}

export interface NWCTXTBar {
  name: "Bar";
  fields: AnyFields;
}

export interface NWCTXTChord {
  name: "Chord";
  fields: AnyFields;
}

export interface NWCTXTKey {
  name: "Key";
  fields: AnyFields;
}

export interface NWCTXTClef {
  name: "Clef";
  fields: AnyFields;
}

export interface NWCTXTTimeSig {
  name: "TimeSig";
  fields: AnyFields;
}

export interface NWCTXTTempo {
  name: "Tempo";
  fields: AnyFields;
}

export interface NWCTXTSustainPedal {
  name: "SustainPedal";
  fields: AnyFields;
}

export interface NWCTXTUser {
  name: "User";
  fields: AnyFields;
}

export interface NWCTXTMPC {
  name: "MPC";
  fields: AnyFields;
}

export interface NWCTXTText {
  name: "Text";
  fields: AnyFields;
}

export interface NWCTXTEnding {
  name: "Ending";
  fields: AnyFields;
}

export interface NWCTXTFlow {
  name: "Flow";
  fields: AnyFields;
}

export interface NWCTXTTempoVariance {
  name: "TempoVariance";
  fields: AnyFields;
}

export interface NWCTXTInstrument {
  name: "Instrument";
  fields: AnyFields;
}

export interface NWCTXTRestChord {
  name: "RestChord";
  fields: AnyFields;
}

export interface NWCTXTPerformanceStyle {
  name: "PerformanceStyle";
  fields: AnyFields;
}

export interface NWCTXTDynamic {
  name: "Dynamic";
  fields: AnyFields;
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
  | NWCTXTRestChord
  | NWCTXTSustainPedal
  | NWCTXTTempo
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
      Label?: string;
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

      /**
       * @example 48
       */
      Patch?: number;
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

      /**
       * @example "Brace,ConnectBars"
       */
      WithNextStaff?: string;
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
