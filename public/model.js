export const uid = () => crypto.randomUUID();
export const clamp = (v, a, b) => Math.min(b, Math.max(a, Number(v) || 0));
export const length = c => (c.out - c.in) / c.speed;
export const duration = p => p.clips.reduce((n,c) => n + length(c), 0);
export const defaultSubtitleStyle = () => ({enabled:true,fontSize:52,color:'#ffffff',background:'#000000',backgroundOpacity:70,position:88});
export const emptyProject = () => ({version:1,name:'나의 첫 영상',media:[],clips:[],tracks:[],subtitles:[],subtitleStyle:defaultSubtitleStyle(),ratio:'original',master:1,fps:30});
export function makeClip(m) {return {id:uid(),mediaId:m.id,in:0,out:m.duration,speed:1,volume:1,mute:false,fadeIn:0,fadeOut:0,sync:0,scale:100,x:0,y:0,rotation:0,flip:false,fit:'contain',stems:false,vocals:1,music:1};}
export function locate(p,t) {let start=0;for(const c of p.clips){const end=start+length(c);if(t<end-0.00001)return {clip:c,start,local:t-start};start=end;}return null;}
export function splitClip(p,id,t) {let start=0;const i=p.clips.findIndex(c=>c.id===id);if(i<0)return false;for(let k=0;k<i;k++)start+=length(p.clips[k]);const c=p.clips[i],local=t-start;if(local<1/p.fps || length(c)-local<1/p.fps)return false;const cut=c.in+local*c.speed;const next={...c,id:uid(),in:cut};c.out=cut;p.clips.splice(i+1,0,next);return true;}
export function outputSize(p) {const m=p.media.find(m=>m.id===p.clips[0]?.mediaId);const ratios={'16:9':[1920,1080],'9:16':[1080,1920],'1:1':[1080,1080],'4:3':[1440,1080]};return ratios[p.ratio]||[Math.max(2,Math.round((m?.width||1920)/2)*2),Math.max(2,Math.round((m?.height||1080)/2)*2)];}
export function validateProject(p,media) {
 if(!p||p.version!==1||!Array.isArray(p.clips)||!Array.isArray(p.tracks)||!Array.isArray(p.media)||p.clips.length>500||p.tracks.length>100||typeof p.name!=='string'||p.name.length>200)throw Error('올바른 프로젝트 파일이 아닙니다.');
 const ids=new Set();for(const c of [...p.clips,...p.tracks]){if(typeof c.id!=='string'||!/^[a-f0-9-]{36}$/.test(c.id)||ids.has(c.id))throw Error('올바르지 않은 컷 ID입니다.');ids.add(c.id);}
 const finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 p.subtitles??=[];p.subtitleStyle={...defaultSubtitleStyle(),...(p.subtitleStyle||{})};
 if(!Array.isArray(p.subtitles)||p.subtitles.length>5000)throw Error('자막 데이터가 올바르지 않습니다.');
 for(const s of p.subtitles){if(typeof s.id!=='string'||!/^[a-f0-9-]{36}$/.test(s.id)||ids.has(s.id)||!finite(s.start,0,86400)||!finite(s.end,s.start+.01,86400)||typeof s.text!=='string'||!s.text.trim()||s.text.length>500)throw Error('자막 시간 또는 내용을 확인해 주세요.');ids.add(s.id);}
 const st=p.subtitleStyle;if(typeof st.enabled!=='boolean'||!finite(st.fontSize,16,160)||!/^#[0-9a-f]{6}$/i.test(st.color)||!/^#[0-9a-f]{6}$/i.test(st.background)||!finite(st.backgroundOpacity,0,100)||!finite(st.position,10,98))throw Error('자막 스타일을 확인해 주세요.');
 if(!['original','16:9','9:16','1:1','4:3'].includes(p.ratio)||!finite(p.master,0,2)||![24,25,30,60].includes(p.fps))throw Error('출력 설정이 올바르지 않습니다.');
 for(const c of p.clips){const m=media[c.mediaId];if(!m||m.kind!=='video'||!finite(c.in,0,m.duration)||!finite(c.out,c.in+0.001,m.duration+0.01)||!finite(c.speed,.25,4)||!finite(c.volume,0,2)||!finite(c.scale,1,400)||!finite(c.x,-200,200)||!finite(c.y,-200,200)||![0,90,180,270].includes(c.rotation)||!['contain','cover'].includes(c.fit)||!finite(c.sync,-1800,1800)||!finite(c.fadeIn,0,1800)||!finite(c.fadeOut,0,1800)||!finite(c.vocals,0,2)||!finite(c.music,0,2))throw Error('컷 설정 또는 원본 미디어를 확인해 주세요.');}
 for(const t of p.tracks){const m=media[t.mediaId];if(!m||!m.hasAudio||!finite(t.start,0,86400)||!finite(t.offset,0,m.duration-0.001)||!finite(t.duration,.001,86400)||!finite(t.volume,0,2)||!finite(t.fadeIn,0,1800)||!finite(t.fadeOut,0,1800))throw Error('음원 설정을 확인해 주세요.');}
 return p;
}
