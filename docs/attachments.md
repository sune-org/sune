# Attachments

Tap the paperclip to attach files, or paste an image or file straight into the message box. You can pick several at once, and send them with or without text.

- The badge on the paperclip counts what is attached. While a video is being prepared it shows the progress in percent.
- To remove them, **long-press the paperclip** (right-click on a computer) and choose **Clear all attachments**.
- Sending waits for a video that is still being prepared, so you can tap send right away.

## What happens to each file

| File | What Sune does with it |
|---|---|
| Images: PNG, JPEG, WebP, GIF, AVIF, JXL | Converted to WebP and scaled down so the longest side is at most 2048 px. Animated images become a still |
| PDF | Sent as it is |
| Audio: WAV, MP3 | Sent as it is |
| Video: MP4, MOV, WebM, MKV and others | Re-encoded on your device to 360p at 4 frames per second, with mono audio |

Video is shrunk hard on purpose. Models only sample a few frames per second, so a small file is usually enough and is far quicker and cheaper to send. Nothing leaves your device until you send the message.

AVIF and JXL only work if your browser can display them.

## What each provider receives

Whether an attachment is understood depends on the key and the model you use.

| Key | Images | PDF | Audio | Video |
|---|---|---|---|---|
| OpenRouter | ✓ | ✓ | ✓ | ✓ |
| Google | ✓ | ✓ | ✓ | ✓ |
| Anthropic | ✓ | ✓ | | |
| OpenAI | ✓ | | | |

- With **OpenRouter**, everything is passed on, and the model has to support the file type. A text-only model will reject or ignore an image.
- A file type the provider can't take is not sent, and you get no error. The model answers as if the file wasn't there.

## Good to know

- **Attachments stay in the thread and are sent again with every later message.** A chat with several videos gets slow and expensive. Start a new chat when you are done with a file.
- **One request can hold 100 MB at most**, counting everything in the thread. Past that the reply says *This request is over the server's 100 MB limit.*
- **Videos in a chat** show as thumbnails. Tap one to play it full screen.
- **Copying a message** leaves out attached images and copies the text.
- **Synced threads carry their attachments**, so media-heavy threads make large files on GitHub. See [Sync and backup](sync.md).
