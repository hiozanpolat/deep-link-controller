import * as Clipboard from 'expo-clipboard';

/** Copies text to the OS clipboard. Returns true on success. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}
