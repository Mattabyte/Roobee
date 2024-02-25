// Helper Class to stream audio recieved as an ArrayBuffer (Azure TTS).
// Azure TTS returns an object 'audioData' that is an array buffer.
// This class is used to process that into a chunked stream to be sent to discord 
// as it is read, to improve performance and the user experience of snappy responses.

const { Readable } = require('stream')

class ArrayBufferToStream extends Readable {
    constructor(arrayBuffer, options) {
      super(options);
      this.buffer = Buffer.from(arrayBuffer);
      this.offset = 0;
      this.chunkSize = 512; // Default chunk size of 512 bytes
    }
  
    _read(size) {
      const chunk = this.buffer.slice(this.offset, this.offset + this.chunkSize);
      this.offset += this.chunkSize;
  
      if (chunk.length === 0) {
        // End of stream
        this.push(null);
      } else {
        this.push(chunk);
      };
    };
};

module.exports = ArrayBufferToStream;