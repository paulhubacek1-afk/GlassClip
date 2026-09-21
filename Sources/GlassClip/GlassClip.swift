import SwiftUI
import UIKit

public struct GlassClipView: View {
    @State private var text = ""
    @State private var history: [String] = []

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.93, green: 0.97, blue: 1.0),
                        Color(red: 0.87, green: 0.91, blue: 1.0)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(spacing: 18) {
                    Image(systemName: "doc.on.clipboard.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.blue)

                    Text("GlassClip")
                        .font(.largeTitle.bold())

                    Text("Dein Clipboard, neu gedacht.")
                        .foregroundStyle(.secondary)

                    HStack {
                        TextField("Text speichern …", text: $text)
                            .textFieldStyle(.roundedBorder)

                        Button("Speichern") {
                            let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !value.isEmpty else { return }
                            history.insert(value, at: 0)
                            history = Array(history.prefix(100))
                            text = ""
                        }
                        .buttonStyle(.borderedProminent)
                    }

                    List {
                        if history.isEmpty {
                            Text("Noch nichts gespeichert.")
                                .foregroundStyle(.secondary)
                        }

                        ForEach(Array(history.enumerated()), id: \.offset) { _, item in
                            Button {
                                UIPasteboard.general.string = item
                            } label: {
                                Text(item)
                                    .lineLimit(3)
                            }
                        }
                    }
                    .scrollContentBackground(.hidden)
                }
                .padding()
            }
            .navigationTitle("GlassClip")
        }
    }
}