/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

self.onmessage = async (event: MessageEvent<{ file: File, maxSize: number, quality: number }>) => {
    const { file, maxSize, quality } = event.data;

    try {
        const imageBitmap = await createImageBitmap(file);

        let { width, height } = imageBitmap;

        if (width > height) {
            if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
            }
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get OffscreenCanvas context');
        }
        ctx.drawImage(imageBitmap, 0, 0, width, height);

        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: quality,
        });

        self.postMessage({ success: true, blob });
    } catch (error) {
        self.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown worker error' });
    }
};
