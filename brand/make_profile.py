from PIL import Image, ImageDraw, ImageFilter
import numpy as np, sys
SRC='/root/.claude/uploads/2632970e-f141-5ee2-aa2b-7713ddf842e9/beee9387-image.png'
src=Image.open(SRC).convert('RGB')
cx,cy,r=624,603,394
crop=src.crop((cx-r+20,cy-r+20,cx+r-20,cy+r-20))
a=np.asarray(crop).astype(float)
alpha=np.clip((185-a[:,:,0])/100,0,1)
red=np.array([229,38,33.])
al=np.maximum(alpha,1e-3)[...,None]
rgb=np.clip((a-(1-al)*red)/al,0,255)          # remove red fringe from edges
rgb=np.where(alpha[...,None]<1,np.minimum(rgb,a),rgb)
glyph=Image.fromarray(np.dstack([rgb.astype(np.uint8),(alpha*255).astype(np.uint8)]),'RGBA')
glyph=glyph.crop(glyph.getbbox())
def flatred(w,h):
    y,x=np.mgrid[0:h,0:w]; d=np.sqrt((x-w*0.38)**2+(y-h*0.3)**2)/max(w,h)
    c0=np.array([238,52,44.]); c1=np.array([204,31,27.])
    return Image.fromarray((c0+(c1-c0)*np.clip(d,0,1)[...,None]).astype(np.uint8),'RGB')
def stamp(bg,gh,cxy):
    g=glyph.resize((int(glyph.width*gh/glyph.height),gh),Image.LANCZOS)
    pad=int(gh*0.12); sh=Image.new('RGBA',(g.width+2*pad,g.height+2*pad),(80,8,6,0))
    m=Image.new('L',sh.size,0); m.paste(g.getchannel('A').point(lambda v:int(v*.5)),(pad,pad)); sh.putalpha(m.filter(ImageFilter.GaussianBlur(gh*0.025)))
    x=cxy[0]-g.width//2; y=cxy[1]-g.height//2
    bg.alpha_composite(sh,(x-pad+int(gh*.02),y-pad+int(gh*.035))); bg.alpha_composite(g,(x,y))
if __name__=='__main__':
    n=1080; bg=flatred(n,n).convert('RGBA'); stamp(bg,int(n*.56),(n//2+8,n//2)); bg.convert('RGB').save('brand/profile-1080.png')
    pv=Image.new('RGB',(n,n),(255,255,255)); mm=Image.new('L',(n,n),0); ImageDraw.Draw(mm).ellipse([0,0,n-1,n-1],fill=255); pv.paste(bg.convert('RGB'),(0,0),mm); pv.resize((540,540)).save(sys.argv[1] if len(sys.argv)>1 else '/tmp/pv.png')
