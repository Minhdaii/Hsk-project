import Link from 'next/link';
import DemoCard from '@/components/landing/DemoCard';
import WordOfDay from '@/components/landing/WordOfDay';

export default function ProductPreview() {
  return <div className="product-preview"><div className="product-preview__window"><div className="product-preview__bar"><span><i/> <i/> <i/></span><span>学汉语 / LEARNING SPACE</span><span>HSK 1</span></div><div className="product-preview__inside"><aside><b>学汉语</b><span>总览</span><span>词汇学习</span><span>语法</span><span>练习</span><span>写汉字</span></aside><div className="product-preview__main"><div className="product-preview__welcome"><div><small>MONDAY · DAILY LEARNING</small><h3>你好，继续今天的学习。</h3><p>一点一点，走得更远。</p></div><div className="product-preview__progress"><span>本周学习</span><b>4 <small>/ 7 天</small></b><i><span/></i></div></div><div className="product-preview__content"><div className="product-preview__word"><WordOfDay /></div><div className="product-preview__card"><DemoCard /></div></div></div></div></div><div className="product-preview__caption"><span>真实产品界面</span><span>词汇 · 复习 · 学习进度</span><Link href="/dashboard">进入学习空间 ↗</Link></div></div>;
}
