import{B as f,F as b,C as d,S as h,W as g,E as y,a as P,b as k,c as m,d as w}from"./index-BpFbQswv.js";const A=URL.createObjectURL(new Blob([`
      class PCMProcessor extends AudioWorkletProcessor {
        constructor() { super(); }
        process(inputs) {
          if (inputs[0]?.[0]) this.port.postMessage(inputs[0][0]);
          return true;
        }
      }
      registerProcessor('pcm-processor', PCMProcessor);
    `],{type:"application/javascript"})),E=URL.createObjectURL(new Blob([`class PlaybackProcessor extends AudioWorkletProcessor {
constructor() {
super();
this.buffer = new Float32Array(44100 * 5); // 1秒缓冲区@48kHz
this.readPointer = 0;
this.writePointer = 0;
this.bufferFill = 0;
this.port.onmessage = (e) => this.queueData(e.data);
}

queueData(newData) {
const float32Data = new Float32Array(newData);
const availableSpace = this.buffer.length - this.bufferFill;
if (newData.length > availableSpace) {
console.warn('Audio buffer overflow');
return;
}

if (this.writePointer + newData.length <= this.buffer.length) {
this.buffer.set(float32Data, this.writePointer);
} else {
const firstPart = this.buffer.length - this.writePointer;
this.buffer.set(float32Data.subarray(0, firstPart), this.writePointer);
this.buffer.set(float32Data.subarray(firstPart), 0);
}
this.writePointer = (this.writePointer + float32Data.length) % this.buffer.length;
this.bufferFill += newData.length;
}

process(_, outputs) {
const output = outputs[0][0];
let samplesNeeded = output.length;
let samplesAvailable = (this.writePointer - this.readPointer + this.buffer.length) % this.buffer.length;

if (samplesAvailable < samplesNeeded) {
output.fill(0);
return true;
}

if (this.readPointer + samplesNeeded <= this.buffer.length) {
output.set(this.buffer.subarray(this.readPointer, this.readPointer + samplesNeeded));
} else {
const firstPart = this.buffer.length - this.readPointer;
output.set(this.buffer.subarray(this.readPointer), 0);
output.set(this.buffer.subarray(0, samplesNeeded - firstPart), firstPart);
}

this.readPointer = (this.readPointer + samplesNeeded) % this.buffer.length;
this.bufferFill = Math.max(0, this.bufferFill - samplesNeeded);
return true;
}
}
registerProcessor('playback-processor', PlaybackProcessor);
`],{type:"application/javascript"}));class C{constructor(e,s,i){this.encoder=e,this.webSocketManager=s,this.config=i,this.audioContext=null,this.workletNode=null,this.stream=null,this.opusChunks=[],this.playbackContext=null,this.playbackNode=null,this.audioQueue=[],this.isPlaying=!1,this.isPaused=!1,this.isWakeUp=!0}async startRecording(){console.log("开始监听语音..."),this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.audioContext=new AudioContext({sampleRate:this.config.sampleRate}),await this.audioContext.audioWorklet.addModule(A);const e=this.audioContext.createMediaStreamSource(this.stream);this.workletNode=new AudioWorkletNode(this.audioContext,"pcm-processor"),this.workletNode.port.onmessage=s=>{const i=s.data,c=new Int16Array(i.length);for(let n=0;n<i.length;n++)c[n]=Math.max(-32768,Math.min(32767,i[n]*32767));const l=this.encoder.encode(c);l&&(this.webSocketManager.sendMessage(l),this.opusChunks.push(l))},e.connect(this.workletNode).connect(this.audioContext.destination)}stopRecording(){console.log("停止监听语音..."),this.stream&&this.stream.getTracks().forEach(e=>e.stop()),this.audioContext&&this.audioContext.close(),this.abortPlayback()}async initPlayback(){this.playbackContext||(this.playbackContext=new AudioContext({sampleRate:this.config.sampleRate}),await this.playbackContext.audioWorklet.addModule(E),this.playbackNode=new AudioWorkletNode(this.playbackContext,"playback-processor"),this.playbackNode.connect(this.playbackContext.destination)),this.playbackContext.state==="suspended"&&await this.playbackContext.resume()}async playAudio(e){if(!this.isWakeUp){this.abortPlayback();return}await this.initPlayback();const s=new Float32Array(e.length);for(let i=0;i<e.length;i++)s[i]=Math.min(1,Math.max(-1,e[i]/32767*.8));this.audioQueue.push(s),this.isPlaying||(this.isPlaying=!0,this.processAudioQueue())}async pausePlayback(){this.isPaused=!this.isPaused,this.playbackContext?.state==="running"&&await this.playbackContext.suspend(),!this.isPaused&&!this.isPlaying&&(this.isPlaying=!0,this.processAudioQueue())}async resumePlayback(){this.isPaused=!1,this.playbackContext?.state==="suspended"&&await this.playbackContext.resume(),this.isPlaying||(this.isPlaying=!0,this.processAudioQueue())}processAudioQueue(){if(this.isPaused)return;if(!this.playbackNode||this.audioQueue.length===0){this.isPlaying=!1;return}const e=this.audioQueue.shift();this.playbackNode.port.postMessage(e),setTimeout(()=>{this.isPaused?setTimeout(()=>this.processAudioQueue(),100):this.processAudioQueue()},20)}abortPlayback(){this.webSocketManager.sendMessage({type:"abort",reason:"wake_word_detected"})}}class x{constructor(e,s){this.channels=e,this.sampleRate=s,this.initialize()}initialize(){this.encoder=new libopus.Encoder(this.channels,this.sampleRate,f,b,!0),this.decoder=new libopus.Decoder(this.channels,this.sampleRate),console.log("Opus encoder and decoder initialized")}encode(e){return this.encoder?(this.encoder.input(e),this.encoder.output()):null}decode(e){return this.decoder.input(e),this.decoder.output()}}let r=0;function R(){const t=localStorage.getItem("WEBSOCKET_URL");t&&t.includes("sealosgzg")?r=16:r=0}R();const p=new x(d,h),o=g.getInstance(),a=new C(p,o,{channels:d,sampleRate:h});function N(){const t=document.getElementById("start"),e=document.getElementById("stop"),s=document.getElementById("stopTTS");t.onclick=async()=>{t.setAttribute("disabled","true"),e.removeAttribute("disabled"),await a.startRecording()},e.onclick=()=>{e.setAttribute("disabled","true"),t.removeAttribute("disabled"),a.stopRecording()},s.onclick=()=>{a.abortPlayback()}}function u(t){const e=document.getElementById("text");e.value+=t}o.addListener(y,t=>{let e;r>0&&t.byteLength>r?e=new Uint8Array(t,r):e=new Uint8Array(t);const s=p.decode(e);a.playAudio(s)});o.addListener(P,t=>{a.isWakeUp&&u("💁‍♂️："+t+`
`)});o.addListener(k,t=>{a.isWakeUp&&u("🤖："+t+`
`)});o.addListener(m,t=>{console.log("检测到唤醒词:",t),a.isWakeUp||(o.sendMessage({type:"listen",state:"detect",text:w}),a.isWakeUp=!0,u("（检测到唤醒词）："+t+`
`))});N();
