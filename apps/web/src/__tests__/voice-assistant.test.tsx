import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { VoiceAssistant } from "../../components/voice-assistant/VoiceAssistant";
import { VoiceWaveform } from "../../components/voice-assistant/VoiceAssistant";

const baseProps = {
  language: "en" as const,
  onToggle: () => {},
  onLanguageChange: () => {},
};

describe("VoiceAssistant", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("idle shows mic hero, Tap to speak bubble, EN pill, no chat UI", () => {
    render(<VoiceAssistant state="idle" continuous={false} {...baseProps} />);
    expect(screen.getByRole("button", { name: "Start voice assistant" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Tap to speak");
    expect(screen.getByRole("button", { name: /assistant language/i })).toHaveTextContent("EN");
    // No waveform while idle
    expect(document.querySelector(".voice-wave-lg")).toBeNull();
    // Voice-first: no text chat surface
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("log")).toBeNull();
  });

  it("listening shows waveform bubble and stop label", () => {
    render(<VoiceAssistant state="listening" continuous={true} {...baseProps} />);
    expect(screen.getByRole("status")).toHaveTextContent("Listening");
    expect(document.querySelector(".voice-wave-lg")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Stop voice assistant" })).toBeVisible();
  });

  it("processing shows thinking status without waveform", () => {
    render(<VoiceAssistant state="processing" continuous={true} {...baseProps} />);
    expect(screen.getByRole("status")).toHaveTextContent("Thinking");
    expect(document.querySelector(".voice-wave-lg")).toBeNull();
  });

  it("speaking shows speaking status with calm waveform", () => {
    const { container } = render(
      <VoiceAssistant state="speaking" continuous={true} {...baseProps} />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Speaking");
    expect(container.querySelector(".voice-wave-lg.voice-wave-calm")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Stop voice assistant" })).toBeVisible();
  });

  it("error shows recovery message", () => {
    render(
      <VoiceAssistant state="error" errorMessage="Mic unavailable" continuous={false} {...baseProps} />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Mic unavailable");
    expect(
      screen.getByRole("button", { name: /error/i })
    ).toBeVisible();
  });

  it("language menu switches between English and Hindi", () => {
    const onLanguageChange = vi.fn();
    render(<VoiceAssistant state="idle" continuous={false} {...baseProps} onLanguageChange={onLanguageChange} />);
    fireEvent.click(screen.getByRole("button", { name: /assistant language/i }));
    const menu = screen.getByRole("menu");
    fireEvent.click(within(menu).getByRole("menuitemradio", { name: "Hindi" }));
    expect(onLanguageChange).toHaveBeenCalledWith("hi");
  });

  it("keeps the same layout chrome in every state", () => {
    const states = ["idle", "listening", "processing", "speaking", "error"] as const;
    for (const state of states) {
      const { unmount } = render(
        <VoiceAssistant
          state={state}
          continuous={state !== "idle"}
          errorMessage="Mic unavailable"
          {...baseProps}
        />
      );
      // One anchor: widget container, status bubble, mic button, EN pill
      expect(screen.getByTestId("voice-widget")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Start|Stop|error/i })).toBeVisible();
      expect(screen.getByRole("button", { name: /assistant language/i })).toBeVisible();
      unmount();
    }
  });
});

describe("VoiceWaveform", () => {
  it("renders symmetric bars with CSS animation by default", () => {
    const { container } = render(<VoiceWaveform bars={13} />);
    const bars = container.querySelectorAll(".voice-wave-lg-bar");
    expect(bars).toHaveLength(13);
    expect(container.querySelector(".voice-wave-driven")).toBeNull();
  });

  it("accepts live amplitude levels without animation", () => {
    const { container } = render(
      <VoiceWaveform levels={[0, 0.5, 1, 0.5, 0]} />
    );
    const driven = container.querySelectorAll(".voice-wave-driven");
    expect(driven).toHaveLength(5);
    expect(driven[2].getAttribute("style")).toContain("height: 100%");
  });
});
