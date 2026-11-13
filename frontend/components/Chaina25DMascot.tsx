import React from 'react';

interface Chaina25DMascotProps {
  className?: string;
}

export default function Chaina25DMascot({ className = 'w-full h-auto max-w-[440px] drop-shadow-md select-none' }: Chaina25DMascotProps) {
  return (
    <svg
      id="chaina25DMascotSvg"
      className={className}
      viewBox="0 0 460 490"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Chaina HSK Cat Companion 2.5D Illustration"
    >
            <defs>
              
              <filter id="softElevationSm" x="-15%" y="-15%" width="130%" height="135%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1E3A5F" floodOpacity="0.10" />
              </filter>

              <filter id="softElevationMd" x="-18%" y="-15%" width="136%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#1A365D" floodOpacity="0.13" />
              </filter>

              <filter id="softCharacterDepth" x="-15%" y="-12%" width="130%" height="132%">
                <feDropShadow dx="-2" dy="10" stdDeviation="8" floodColor="#1E3A5F" floodOpacity="0.14" />
              </filter>

              
              
              <linearGradient id="archOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DCEEF9" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#CBE4F5" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="archInnerGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#FAFDFF" />
                <stop offset="100%" stopColor="#EBF5FC" />
              </linearGradient>

              
              <linearGradient id="platformSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DFEFFA" />
                <stop offset="100%" stopColor="#B9D9EE" />
              </linearGradient>

              
              <linearGradient id="catCreamFurGrad" x1="22%" y1="8%" x2="82%" y2="92%">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="58%" stopColor="#FAF3E8" />
                <stop offset="100%" stopColor="#EADBC8" />
              </linearGradient>

              
              <radialGradient id="catHeadShading" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="62%" stopColor="#FAF2E6" />
                <stop offset="100%" stopColor="#E7D6C1" />
              </radialGradient>

              
              <linearGradient id="catApricotPatchGrad" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#F7B77D" />
                <stop offset="60%" stopColor="#EE9B54" />
                <stop offset="100%" stopColor="#D97E38" />
              </linearGradient>

              
              <linearGradient id="earInnerPeachGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F9C5CE" />
                <stop offset="100%" stopColor="#EDA0AF" />
              </linearGradient>

              
              <linearGradient id="chainaScarfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E85D47" />
                <stop offset="55%" stopColor="#D84A34" />
                <stop offset="100%" stopColor="#B63522" />
              </linearGradient>

              
              <linearGradient id="pageLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="82%" stopColor="#F7F2E7" />
                <stop offset="100%" stopColor="#E2D9C8" />
              </linearGradient>

              <linearGradient id="pageRightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2D9C8" />
                <stop offset="18%" stopColor="#F7F2E7" />
                <stop offset="100%" stopColor="#FFFDF9" />
              </linearGradient>
            </defs>

            
            
            <path
              d="M 56 410 L 56 176 C 56 76, 404 76, 404 176 L 404 410 Z"
              fill="#D4E9F7"
            />

            
            <path
              d="M 74 410 L 74 182 C 74 96, 386 96, 386 182 L 386 410 Z"
              fill="url(#archInnerGrad)"
              filter="url(#softElevationSm)"
            />

            
            <circle cx="215" cy="215" r="108" fill="#FFF9F0" opacity="0.65" />

            
            <g transform="translate(64, 96)" filter="url(#softElevationSm)">
              
              <rect x="3" y="4" width="76" height="40" rx="11" fill="#BDD8EC" />
              
              <rect x="0" y="0" width="76" height="40" rx="11" fill="#FFFFFF" />
              <circle cx="14" cy="20" r="3.5" fill="#D84A34" opacity="0.85" />
              <text x="44" y="26" textAnchor="middle" className="font-serif-sc" fill="#26252D" fontSize="17" fontWeight="700">学习</text>
            </g>

            
            <g transform="translate(316, 86)" filter="url(#softElevationSm)">
              
              <rect x="3" y="4" width="74" height="38" rx="11" fill="#BDD8EC" />
              <rect x="0" y="0" width="74" height="38" rx="11" fill="#FFFFFF" />
              <circle cx="14" cy="19" r="3.5" fill="#DA88A0" />
              <text x="43" y="25" textAnchor="middle" className="font-serif-sc" fill="#26252D" fontSize="16" fontWeight="700">你好</text>
            </g>

            
            <g transform="translate(342, 168)" filter="url(#softElevationSm)">
              <rect x="3" y="4" width="48" height="82" rx="10" fill="#C4DCEC" />
              <rect x="0" y="0" width="48" height="82" rx="10" fill="#FFFDF9" />
              <text x="24" y="31" textAnchor="middle" className="font-serif-sc" fill="#26252D" fontSize="17" fontWeight="700">汉</text>
              <text x="24" y="55" textAnchor="middle" className="font-serif-sc" fill="#26252D" fontSize="17" fontWeight="700">字</text>
              <rect x="17" y="63" width="14" height="10" rx="2.5" fill="#D84A34" />
            </g>

            
            <ellipse cx="230" cy="410" rx="188" ry="22" fill="url(#platformSurfaceGrad)" />
            <ellipse cx="226" cy="404" rx="146" ry="13" fill="#9BC3DF" opacity="0.55" />

            
            <g id="hskBookStack25D" transform="translate(58, 308)" filter="url(#softElevationSm)">
              
              <path
                d="M 8 54 L 128 54 C 134 54, 138 58, 138 64 L 138 74 C 138 80, 134 84, 128 84 L 8 84 C 3 84, 0 80, 0 74 L 0 64 C 0 58, 3 54, 8 54 Z"
                fill="#DA88A0"
              />
              
              <rect x="10" y="59" width="120" height="20" rx="4" fill="#FFFDF8" />
              <line x1="16" y1="66" x2="122" y2="66" stroke="#E2D9C8" strokeWidth="1.5" />
              <line x1="16" y1="72" x2="114" y2="72" stroke="#E2D9C8" strokeWidth="1.5" />
              
              <rect x="0" y="54" width="38" height="30" rx="6" fill="#C9738C" />
              <text x="19" y="73" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">HSK</text>

              
              <g transform="translate(10, -28)">
                <rect x="0" y="54" width="124" height="28" rx="6" fill="#5B9BD5" />
                <rect x="8" y="58" width="110" height="20" rx="3.5" fill="#FAF6EE" />
                <rect x="0" y="54" width="42" height="28" rx="6" fill="#4A86C0" />
                <text x="21" y="72" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">HSK 4</text>
              </g>
            </g>

            
            <g id="chainaMascotCat25D" filter="url(#softCharacterDepth)">
              
              
              <ellipse cx="236" cy="382" rx="84" ry="14" fill="#8BB5D3" opacity="0.5" />

              
              <g id="catTail25D">
                <path
                  d="M 284 344 C 344 346, 376 306, 362 260 C 355 238, 330 240, 326 260 C 321 284, 308 312, 276 318 Z"
                  fill="url(#catApricotPatchGrad)"
                />
                
                <path
                  d="M 362 260 C 355 238, 330 240, 326 260 C 336 268, 350 268, 362 260 Z"
                  fill="#FFFDF9"
                />
              </g>

              
              <g id="catBody25D">
                
                <path
                  d="M 156 364 C 148 294, 164 226, 232 226 C 300 226, 314 294, 306 364 C 282 374, 180 374, 156 364 Z"
                  fill="url(#catCreamFurGrad)"
                />

                
                <path
                  d="M 256 232 C 292 244, 308 286, 306 342 C 278 336, 260 308, 256 268 Z"
                  fill="url(#catApricotPatchGrad)"
                  opacity="0.92"
                />

                
                <path
                  d="M 192 252 C 206 262, 254 262, 268 252 C 262 288, 248 312, 230 318 C 212 312, 198 288, 192 252 Z"
                  fill="#FFFFFF"
                  opacity="0.85"
                />
              </g>

              
              <g id="catChainaScarf25D" filter="url(#softElevationSm)">
                
                <path
                  d="M 172 226 C 198 244, 266 244, 290 226 C 294 236, 290 248, 280 252 C 252 264, 210 264, 182 252 C 172 248, 168 236, 172 226 Z"
                  fill="url(#chainaScarfGrad)"
                />
                
                <path
                  d="M 194 246 C 188 268, 186 286, 190 300 C 200 303, 210 301, 216 296 C 216 280, 214 264, 212 250 Z"
                  fill="url(#chainaScarfGrad)"
                />
                
                <path
                  d="M 189 290 C 198 293, 207 292, 216 288 L 216 293 C 207 297, 198 298, 189 295 Z"
                  fill="#FFFDF9"
                  opacity="0.85"
                />
              </g>

              
              <g id="catHead25D" filter="url(#softElevationSm)">
                
                
                <path
                  d="M 158 168 L 142 98 C 140 88, 149 83, 157 89 L 210 130 Z"
                  fill="url(#catCreamFurGrad)"
                />
                <path
                  d="M 163 156 L 152 106 C 151 102, 155 100, 158 103 L 194 132 Z"
                  fill="url(#earInnerPeachGrad)"
                />

                
                <path
                  d="M 304 168 L 320 98 C 322 88, 313 83, 305 89 L 252 130 Z"
                  fill="url(#catApricotPatchGrad)"
                />
                <path
                  d="M 299 156 L 310 106 C 311 102, 307 100, 304 103 L 268 132 Z"
                  fill="url(#earInnerPeachGrad)"
                />

                
                <path
                  d="M 146 184 C 146 132, 180 116, 231 116 C 282 116, 316 132, 316 184 C 316 222, 282 242, 231 242 C 180 242, 146 222, 146 184 Z"
                  fill="url(#catHeadShading)"
                />

                
                <path
                  d="M 236 116 C 280 117, 313 136, 315 178 C 286 176, 256 158, 236 116 Z"
                  fill="url(#catApricotPatchGrad)"
                />

                
                <rect x="228" y="124" width="5" height="15" rx="2.5" fill="#E59A59" opacity="0.65" />
                <rect x="217" y="127" width="4" height="11" rx="2" fill="#E59A59" opacity="0.45" />

                
                
                <ellipse cx="195" cy="178" rx="8.5" ry="9.5" fill="#2D262E" />
                <circle cx="192" cy="174.5" r="3" fill="#FFFFFF" />
                <circle cx="198" cy="181.5" r="1.3" fill="#FFFFFF" opacity="0.7" />
                
                <path d="M 183 171 C 188 165, 202 165, 207 171" fill="none" stroke="#8C7A6B" strokeWidth="1.8" strokeLinecap="round" />

                
                <ellipse cx="267" cy="178" rx="8.5" ry="9.5" fill="#2D262E" />
                <circle cx="264" cy="174.5" r="3" fill="#FFFFFF" />
                <circle cx="270" cy="181.5" r="1.3" fill="#FFFFFF" opacity="0.7" />
                <path d="M 255 171 C 260 165, 274 165, 279 171" fill="none" stroke="#7A5438" strokeWidth="1.8" strokeLinecap="round" />

                
                <ellipse cx="172" cy="193" rx="10" ry="5.5" fill="#F4A2B2" opacity="0.45" />
                <ellipse cx="290" cy="193" rx="10" ry="5.5" fill="#F4A2B2" opacity="0.45" />

                
                <ellipse cx="231" cy="196" rx="22" ry="14" fill="#FFFFFF" opacity="0.9" />

                
                <path
                  d="M 225 188 C 225 186, 237 186, 237 188 C 237 192, 233 195, 231 195 C 229 195, 225 192, 225 188 Z"
                  fill="#D84A34"
                />

                
                <path
                  d="M 220 200 C 225 204, 231 201, 231 195 C 231 201, 237 204, 242 200"
                  fill="none"
                  stroke="#5C4D42"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                
                <path d="M 136 186 Q 150 187 162 189" fill="none" stroke="#9C8B7A" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 134 198 Q 148 197 162 196" fill="none" stroke="#9C8B7A" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 300 189 Q 312 187 326 186" fill="none" stroke="#9C8B7A" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 300 196 Q 314 197 328 198" fill="none" stroke="#9C8B7A" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              
              <g id="catFrontPaws25D" filter="url(#softElevationSm)">
                
                <path
                  d="M 178 332 C 176 352, 184 364, 198 364 C 212 364, 218 352, 216 332 Z"
                  fill="#FFFDF9"
                />
                <line x1="192" y1="352" x2="192" y2="361" stroke="#D5C3B0" strokeWidth="2" strokeLinecap="round" />
                <line x1="203" y1="352" x2="203" y2="361" stroke="#D5C3B0" strokeWidth="2" strokeLinecap="round" />

                
                <path
                  d="M 248 332 C 246 352, 254 364, 268 364 C 282 364, 288 352, 286 332 Z"
                  fill="#FFFDF9"
                />
                <line x1="262" y1="352" x2="262" y2="361" stroke="#D5C3B0" strokeWidth="2" strokeLinecap="round" />
                <line x1="273" y1="352" x2="273" y2="361" stroke="#D5C3B0" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>

            
            <g id="foregroundOpenBookAndBrush" filter="url(#softElevationMd)">
              
              
              <path
                d="M 114 374 L 232 384 L 350 374 L 364 412 L 232 424 L 100 412 Z"
                fill="#D84A34"
              />

              
              <path
                d="M 118 370 C 156 364, 196 368, 232 380 L 232 416 C 194 404, 152 400, 108 406 Z"
                fill="#E8DFCE"
              />
              <path
                d="M 120 365 C 158 359, 196 363, 232 376 L 232 411 C 194 399, 154 395, 112 401 Z"
                fill="url(#pageLeftGrad)"
              />

              
              <path
                d="M 232 380 C 268 368, 308 364, 346 370 L 356 406 C 312 400, 270 404, 232 416 Z"
                fill="#E8DFCE"
              />
              <path
                d="M 232 376 C 268 363, 306 359, 344 365 L 352 401 C 310 395, 270 399, 232 411 Z"
                fill="url(#pageRightGrad)"
              />

              
              <line x1="232" y1="375" x2="232" y2="416" stroke="#CBBFA8" strokeWidth="2" />

              
              <text x="172" y="387" textAnchor="middle" className="font-serif-sc" fill="#26252D" fontSize="13" fontWeight="700">汉语 • HSK</text>
              <line x1="142" y1="394" x2="206" y2="396" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

              
              <line x1="256" y1="384" x2="320" y2="381" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <line x1="256" y1="392" x2="306" y2="390" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <rect x="314" y="385" width="12" height="9" rx="2" fill="#D84A34" opacity="0.9" />

              
              <path
                d="M 232 411 L 224 434 L 232 429 L 240 434 Z"
                fill="#D84A34"
              />

              
              <g transform="translate(328, 344)">
                
                <path
                  d="M 26 24 C 32 14, 38 14, 42 20 C 46 12, 54 12, 58 20 C 62 15, 68 15, 72 24 Z"
                  fill="#5B9BD5"
                />
                
                <path
                  d="M 6 12 L 82 22"
                  stroke="#C98A55"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                
                <rect x="4" y="9" width="8" height="6" rx="1.5" transform="rotate(7 8 12)" fill="#D84A34" />
                
                <path
                  d="M 5 12 C -6 9, -13 11, -17 15 C -11 18, -3 17, 5 15 Z"
                  fill="#26252D"
                />
              </g>

            </g>
          </svg>
  );
}
