import type { AnyEvent } from "midifile-ts";
import type { MidiEvents } from "../src/midi";

export class MidiEventsLog implements MidiEvents {
  midiEvents: AnyEvent[] = [];
  #delay = 0;

  applyDelay(delay: number) {
    this.#delay += delay;
  }

  #getDeltaTime() {
    const res = this.#delay;
    this.#delay = 0;
    return res;
  }

  noteOn(channel: number, noteNumber: number, velocity: number): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "channel",
      subtype: "noteOn",
      channel,
      noteNumber,
      velocity
    });
  }

  noteOff(channel: number, noteNumber: number, velocity: number): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "channel",
      subtype: "noteOff",
      channel,
      noteNumber,
      velocity
    });
  }

  controller(channel: number, controllerType: number, value: number): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "channel",
      subtype: "controller",
      channel,
      controllerType,
      value
    });
  }

  setTempo(microsecondsPerBeat: number): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "meta",
      subtype: "setTempo",
      microsecondsPerBeat
    });
  }

  timeSignature(numerator: number, denominator: number, metronome: number, thirtyseconds: number): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "meta",
      subtype: "timeSignature",
      numerator,
      denominator,
      metronome,
      thirtyseconds
    });
  }

  programChange(channel: number, value: number): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "channel",
      subtype: "programChange",
      channel,
      value
    });
  }

  endOfTrack(): void {
    this.midiEvents.push({
      deltaTime: this.#getDeltaTime(),
      type: "meta",
      subtype: "endOfTrack"
    });
  }
}
