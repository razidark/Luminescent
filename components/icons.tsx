
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

const DuotoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, className, viewBox = "0 0 24 24", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <defs>
            <linearGradient id="duotone-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--theme-gradient-from, #d946ef)" />
                <stop offset="100%" stopColor="var(--theme-gradient-to, #8b5cf6)" />
            </linearGradient>
        </defs>
        {children}
    </svg>
);

export const LuminescenceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M12 2V12M12 22V12M3.34 7L12 12M20.66 17L12 12M3.34 17L12 12M20.66 7L12 12" stroke="url(#duotone-gradient)" opacity="0.6" />
        <path d="M12 7.5L13.2 10.8L16.5 12L13.2 13.2L12 16.5L10.8 13.2L7.5 12L10.8 10.8L12 7.5Z" fill="url(#duotone-gradient)" stroke="none" />
        <circle cx="12" cy="2" r="1" fill="url(#duotone-gradient)" stroke="none" />
        <circle cx="12" cy="22" r="1" fill="url(#duotone-gradient)" stroke="none" />
    </DuotoneIcon>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 14.89V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.11" stroke="currentColor" opacity="0.6"/>
        <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#duotone-gradient)" stroke="none"/>
        <path d="M19 3l1 2.5L22.5 6.5 20 7.5 19 10l-1-2.5L15.5 6.5 18 5.5 19 3z" fill="currentColor" opacity="0.6" stroke="none" />
    </DuotoneIcon>
);

export const EnhanceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" opacity="0.4" />
        <path d="M12 8v8M8 12h8" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M18.36 5.64l-1.41 1.41M7.05 16.95l-1.41 1.41M18.36 16.95l-1.41-1.41M7.05 5.64l-1.41-1.41" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M18 2L22 6" stroke="currentColor" opacity="0.6" />
        <path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22l5.5-1.5z" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
        <path d="M15 2l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z" fill="currentColor" stroke="none" opacity="0.7" />
    </DuotoneIcon>
);

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M23 7l-7 5 7 5V7z" stroke="url(#duotone-gradient)" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" />
        <circle cx="8" cy="12" r="2" fill="url(#duotone-gradient)" stroke="none" opacity="0.7" />
    </DuotoneIcon>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="url(#duotone-gradient)" />
        <path d="M7 3h10" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const UpscaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 21l-6-6" stroke="currentColor" opacity="0.6"/>
        <path d="M3 10V3h7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M21 10V3h-7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3 14v7h7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" />
    </DuotoneIcon>
);

export const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M8 8h8v8H8z" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const AddProductIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 5v14M5 12h14" stroke="url(#duotone-gradient)" strokeWidth="2.5" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" opacity="0.5" />
    </DuotoneIcon>
);

export const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 9h12a6 6 0 1 1 0 12h-3" stroke="currentColor" strokeOpacity="0.6"/>
        <path d="M7 13L3 9l4-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 9H9a6 6 0 1 0 0 12h3" stroke="currentColor" strokeOpacity="0.6"/>
        <path d="M17 13l4-4-4-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 8v4l3 3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" stroke="currentColor" opacity="0.7"/>
    </DuotoneIcon>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" opacity="0.6"/>
        <circle cx="12" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.6"/>
        <path d="M12 16v-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M12 8h.01" stroke="url(#duotone-gradient)" strokeWidth="3" strokeLinecap="round" />
    </DuotoneIcon>
);

export const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="currentColor" opacity="0.6"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" opacity="0.6"/>
        <path d="M11 8v6M8 11h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="currentColor" opacity="0.6"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" opacity="0.6"/>
        <path d="M8 11h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const FitToScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" opacity="0.6"/>
    </DuotoneIcon>
);

export const ActualSizeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity="0.6"/>
        <path d="M9 12h6M12 9v6" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const GifIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" opacity="0.6" />
        <path d="M7 10h3v4H7zM14 10h3v4h-3z" stroke="url(#duotone-gradient)" />
        <path d="M11 10v4" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 4v6h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" opacity="0.7"/>
    </DuotoneIcon>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" opacity="0.6"/>
        <path d="M7 10l5 5 5-5M12 15V3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" opacity="0.6"/>
        <path d="M17 21v-8H7v8M7 3v5h8" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.6" />
        <path d="M12 6v6l4 2" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" opacity="0.6"/>
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const EraserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M7 21L2.7 16.7a1 1 0 0 1 0-1.4l11-11a1 1 0 0 1 1.4 0l7.2 7.2a1 1 0 0 1 0 1.4L15 20.3a1 1 0 0 1-1.4 0L11 17.7M7 21h10" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
        <path d="M11 17.7L7 21" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const PaintBrushIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M18 2L22 6" stroke="currentColor" opacity="0.6" />
        <path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22l5.5-1.5z" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const RemoveBgIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 21l18-18" stroke="currentColor" opacity="0.4" strokeDasharray="4 4" />
        <path d="M15 15l6 6" stroke="currentColor" opacity="0.6"/>
        <rect x="7" y="7" width="10" height="10" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const CardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" opacity="0.6"/>
        <path d="M7 8h10M7 12h10M7 16h6" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const TextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const MemeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className} fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.6"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="url(#duotone-gradient)" strokeWidth="2" strokeLinecap="round"/>
    </DuotoneIcon>
);

export const RetouchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 21a9 9 0 1 0-9-9c0 4.97 4.03 9 9 9z" stroke="currentColor" opacity="0.5"/>
        <path d="M12 8v8M8 12h8" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const ProductIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" opacity="0.6"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const CropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M6 1v15a2 2 0 0 0 2 2h15" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M1 6l15-1a2 2 0 0 1 2 2v15" stroke="currentColor" opacity="0.6"/>
    </DuotoneIcon>
);

export const AdjustIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 14h6M9 8h6M17 16h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const GalleryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" opacity="0.6"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M21 15l-5-5L5 21" stroke="url(#duotone-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
    </DuotoneIcon>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 19V5m-7 7l7-7 7 7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" opacity="0.6"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const VariationsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="7" height="7" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" opacity="0.6" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" opacity="0.6" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C22 6 17.5 2 12 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <circle cx="7.5" cy="10.5" r="1" fill="currentColor" opacity="0.6" />
        <circle cx="10.5" cy="7.5" r="1" fill="currentColor" opacity="0.6" />
        <circle cx="13.5" cy="7.5" r="1" fill="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" opacity="0.6"/>
        <circle cx="12" cy="5" r="2" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M12 7v4M8 16h.01M16 16h.01" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const FocusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" opacity="0.6"/>
    </DuotoneIcon>
);

export const MergeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 16l4-4M16 8l4-4" stroke="currentColor" opacity="0.5"/>
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="18" cy="5" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <circle cx="6" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <circle cx="18" cy="19" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" opacity="0.7" />
    </DuotoneIcon>
);

export const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 3v18M3 12h18" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.5" />
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#duotone-gradient)" stroke="none"/>
    </DuotoneIcon>
);

export const HDRIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 12h18M12 3v18" stroke="currentColor" opacity="0.5"/><circle cx="12" cy="12" r="6" stroke="url(#duotone-gradient)" strokeWidth="2.5"/></DuotoneIcon>;
export const HDIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="6" width="20" height="12" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M7 9v6M10 9v6M14 9h2a2 2 0 0 1 0 4h-2V9z" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const LayersIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" opacity="0.6" /></DuotoneIcon>;
export const NoSymbolIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.6"/><path d="M4.93 4.93l14.14 14.14" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const CircuitBoardIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" opacity="0.4"/><path d="M6 9h4l2 3h6M6 15h4l2-3h6" stroke="url(#duotone-gradient)" strokeWidth="1.5" /><circle cx="6" cy="9" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/><circle cx="6" cy="15" r="1" fill="currentColor"/></DuotoneIcon>;
export const GridIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="7" height="7" stroke="currentColor" opacity="0.6"/><rect x="14" y="3" width="7" height="7" stroke="url(#duotone-gradient)" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" opacity="0.6"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const HandIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M18 11V6a2 2 0 0 0-2-2M14 10V4a2 2 0 0 0-2-2M10 10.5V6a2 2 0 0 0-2-2" stroke="currentColor" opacity="0.6"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-3.6-3-6l2-3" stroke="url(#duotone-gradient)" strokeWidth="2" /></DuotoneIcon>;
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M22 11v1a10 10 0 1 1-5.93-9.14" stroke="currentColor" opacity="0.6" /><path d="M22 4L12 14l-3-3" stroke="url(#duotone-gradient)" strokeWidth="2" /></DuotoneIcon>;
export const QuestionMarkIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.6"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="url(#duotone-gradient)" strokeWidth="2" strokeLinecap="round"/></DuotoneIcon>;
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="11" cy="11" r="8" stroke="url(#duotone-gradient)" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" opacity="0.6" /></DuotoneIcon>;
export const MicrophoneOnIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" opacity="0.6"/><path d="M12 19v4M8 23h8" stroke="currentColor" opacity="0.6" /></DuotoneIcon>;
export const MicrophoneOffIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" opacity="0.5"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const SunIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>;
export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>;

// MISSING ICONS
export const CropAutoIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M6 1v15a2 2 0 0 0 2 2h15" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M1 6l15-1a2 2 0 0 1 2 2v15" stroke="currentColor" opacity="0.6"/><path d="M16 4l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;
export const SynthwaveIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 12h18M3 15h18M3 18h18" stroke="url(#duotone-gradient)" opacity="0.5"/><path d="M12 2L2 22h20L12 2z" stroke="currentColor" /></DuotoneIcon>;
export const AnimeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M8 12s1-2 4-2 4 2 4 2" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const LomoIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor"/><circle cx="12" cy="12" r="6" stroke="url(#duotone-gradient)" strokeWidth="3" opacity="0.6"/></DuotoneIcon>;
export const GlitchIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 7h18M3 12h18M3 17h18" stroke="url(#duotone-gradient)" strokeWidth="2" strokeDasharray="4 2"/><path d="M5 5v14M19 5v14" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const CyberpunkIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 2h20v20H2z" stroke="url(#duotone-gradient)"/><path d="M6 6h12M6 12h12M6 18h12" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const FilmNoirIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L2 22h20L12 2z" fill="currentColor" opacity="0.2"/><path d="M12 2L2 22h10V2z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;
export const WatercolorIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 8-11 8-11s8 6.582 8 11c0 4.418-3.582 8-8 8z" stroke="url(#duotone-gradient)" strokeWidth="2" fill="url(#duotone-gradient)" fillOpacity="0.2"/></DuotoneIcon>;
export const VintageIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor"/><path d="M3 15l5-5 5 5 5-5 3 3" stroke="url(#duotone-gradient)"/></DuotoneIcon>;
export const PopArtIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="7" height="7" fill="url(#duotone-gradient)"/><rect x="14" y="3" width="7" height="7" fill="currentColor" opacity="0.6"/><rect x="3" y="14" width="7" height="7" fill="currentColor" opacity="0.6"/><rect x="14" y="14" width="7" height="7" fill="url(#duotone-gradient)"/></DuotoneIcon>;
export const SteampunkIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="8" stroke="currentColor"/><path d="M12 8v8M8 12h8" stroke="url(#duotone-gradient)" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="url(#duotone-gradient)"/></DuotoneIcon>;
export const ClaymationIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="url(#duotone-gradient)" strokeWidth="3" opacity="0.5"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3"/></DuotoneIcon>;
export const BlueprintIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="2" width="20" height="20" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M2 6h20M2 12h20M2 18h20M6 2v20M12 2v20M18 2v20" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const ComicBookIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor"/><path d="M2 10h20M12 10v12" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const InfraredIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 2v20M2 12h20" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const GouacheIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 4c16 0 16 16 16 16" stroke="url(#duotone-gradient)" strokeWidth="4" opacity="0.6"/><path d="M20 4C4 4 4 20 4 20" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const DoubleExposureIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="9" cy="12" r="6" stroke="url(#duotone-gradient)"/><circle cx="15" cy="12" r="6" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const LongExposureIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" stroke="currentColor"/><path d="M12 12c4 0 8 4 8 4" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.7"/></DuotoneIcon>;
export const TiltShiftIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 6h20M2 18h20" stroke="url(#duotone-gradient)" strokeWidth="3"/><rect x="2" y="9" width="20" height="6" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const SolarizedIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M12 2v20" stroke="url(#duotone-gradient)" strokeWidth="4" opacity="0.5"/></DuotoneIcon>;
export const PixelArtIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;
export const ArtDecoIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L2 12l10 10 10-10L12 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 6l-6 6 6 6 6-6-6-6z" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const ArtNouveauIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 20c0-10 8-10 8-18m0 0c0 8 8 8 8 18" stroke="url(#duotone-gradient)" strokeWidth="2" strokeLinecap="round"/></DuotoneIcon>;
export const RevolutionaryPropagandaIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 22L12 2l10 20H2z" fill="url(#duotone-gradient)" stroke="none"/><path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2"/></DuotoneIcon>;
export const CorporateIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="18" height="12" rx="2" stroke="currentColor"/><path d="M7 21h10M12 15v6" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const PunkRockCollageIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 3l18 18M21 3L3 21" stroke="url(#duotone-gradient)" strokeWidth="4" opacity="0.4"/><path d="M5 5h14v14H5z" stroke="currentColor" strokeDasharray="2 2"/></DuotoneIcon>;
export const MinimalistFreedomIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="1" fill="url(#duotone-gradient)"/><path d="M2 12h20" stroke="currentColor" opacity="0.2"/></DuotoneIcon>;
export const RoyalRegaliaIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M5 15l2-8 5 4 5-4 2 8H5z" stroke="url(#duotone-gradient)" strokeWidth="2"/><circle cx="12" cy="18" r="2" fill="currentColor" opacity="0.6"/></DuotoneIcon>;
export const MatrixIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 2v20M8 2v20M12 2v20M16 2v20M20 2v20" stroke="url(#duotone-gradient)" strokeWidth="1" strokeDasharray="2 4"/></DuotoneIcon>;
export const BladeRunnerIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 12h20M2 14h20M2 16h20" stroke="url(#duotone-gradient)" opacity="0.8"/><path d="M4 2v20L20 2v20" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const WesAndersonIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="4" y="4" width="16" height="16" stroke="url(#duotone-gradient)" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" opacity="0.5"/></DuotoneIcon>;
export const MadMaxIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 22L12 2l10 20" stroke="url(#duotone-gradient)" strokeWidth="3"/><path d="M2 18h20" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const AmelieIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#duotone-gradient)" stroke="none" opacity="0.6"/></DuotoneIcon>;
export const GoldenHourIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="10" r="6" fill="url(#duotone-gradient)" stroke="none"/><path d="M2 18h20" stroke="currentColor" strokeWidth="2"/></DuotoneIcon>;
export const MonochromeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M12 2a10 10 0 0 0 0 20V2z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;
export const SketchIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 19l7-7 3 3-7 7-3-3z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M18 13l-1.5-1.5" stroke="currentColor" opacity="0.6"/><path d="M2 22l5-5" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const OrigamiIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L2 12h10V2z" fill="url(#duotone-gradient)" opacity="0.5"/><path d="M12 2l10 10H12V2z" fill="currentColor" opacity="0.3"/><path d="M12 22l10-10H12v10z" fill="url(#duotone-gradient)" opacity="0.8"/><path d="M12 22L2 12h10v10z" fill="currentColor" opacity="0.6"/></DuotoneIcon>;
export const UkiyoeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 18c4-4 8 4 12 0s8-4 8-4" stroke="url(#duotone-gradient)" strokeWidth="3"/><circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.4"/></DuotoneIcon>;
export const VanGoghIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 12c0-4 4-8 8-8s8 4 8 8-4 8-8 8-8-4-8-8z" stroke="url(#duotone-gradient)" strokeWidth="4" strokeDasharray="2 2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></DuotoneIcon>;
export const GhibliIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" stroke="currentColor" opacity="0.3"/><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="url(#duotone-gradient)" strokeWidth="3" strokeLinecap="round"/></DuotoneIcon>;
export const DuneIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 20c4-4 8-4 12 0s8 4 8 4" fill="url(#duotone-gradient)" stroke="none" opacity="0.6"/><circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.4"/></DuotoneIcon>;
export const ArcaneIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2l10 10-10 10L2 12 12 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 6v12M6 12h12" stroke="currentColor" opacity="0.5"/></DuotoneIcon>;
export const SpiderVerseIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="url(#duotone-gradient)" strokeWidth="1" opacity="0.6"/></DuotoneIcon>;
export const BokehIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="8" cy="8" r="4" fill="url(#duotone-gradient)" opacity="0.4"/><circle cx="16" cy="16" r="5" fill="currentColor" opacity="0.2"/><circle cx="14" cy="6" r="3" fill="url(#duotone-gradient)" opacity="0.3"/></DuotoneIcon>;
export const LightLeakIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M22 2L2 22" stroke="url(#duotone-gradient)" strokeWidth="8" opacity="0.3"/><path d="M18 2L2 18" stroke="currentColor" strokeWidth="4" opacity="0.2"/></DuotoneIcon>;
export const Anaglyph3DIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor"/><circle cx="8" cy="12" r="2" fill="#ff0000" opacity="0.6"/><circle cx="16" cy="12" r="2" fill="#00ffff" opacity="0.6"/></DuotoneIcon>;
export const StudioLightIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="4" fill="url(#duotone-gradient)"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const ClarifyIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2v20M2 12h20" stroke="currentColor" opacity="0.2"/><circle cx="12" cy="12" r="6" stroke="url(#duotone-gradient)" strokeWidth="3"/></DuotoneIcon>;
export const VibranceIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1 3-7z" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.8"/></DuotoneIcon>;
export const SoftGlowIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="8" fill="url(#duotone-gradient)" opacity="0.3" filter="blur(2px)"/></DuotoneIcon>;
export const NeonIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M5 5h14v14H5z" stroke="url(#duotone-gradient)" strokeWidth="3" opacity="0.9" filter="blur(1px)"/></DuotoneIcon>;
export const PastelIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="4" y="4" width="16" height="16" rx="4" fill="url(#duotone-gradient)" opacity="0.2" stroke="currentColor" strokeWidth="1"/></DuotoneIcon>;
export const CharcoalIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 18l4-4 4 4 4-4 4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="square" opacity="0.6"/></DuotoneIcon>;
export const OilPaintIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" stroke="url(#duotone-gradient)"/><circle cx="12" cy="12" r="4" fill="url(#duotone-gradient)" opacity="0.2"/></DuotoneIcon>;
export const MosaicIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 3h4v4H3zM9 3h6v6H9zM17 3h4v4h-4zM3 9h6v6H3zM11 11h2v2h-2zM15 9h6v6h-6zM3 17h4v4H3zM9 15h6v6H9zM17 17h4v4h-4z" fill="url(#duotone-gradient)" opacity="0.6"/></DuotoneIcon>;
export const PsychedelicIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" stroke="currentColor" opacity="0.6"/><circle cx="12" cy="12" r="2" fill="url(#duotone-gradient)"/></DuotoneIcon>;
export const StyleTransferIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" stroke="currentColor" opacity="0.5"/><path d="M7 7l10 10M17 7L7 10l10 7" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const CaptionIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="15" width="18" height="6" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M7 18h10" stroke="currentColor" opacity="0.6"/><path d="M3 5h18v6H3z" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" opacity="0.6"/><circle cx="12" cy="13" r="4" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 5v14M5 12l7 7 7-7" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M19 12H5M12 19l-7-7 7-7" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M5 12h14M12 5l7 7-7 7" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const InvertIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M12 2a10 10 0 0 1 0 20" fill="url(#duotone-gradient)" opacity="0.6"/></DuotoneIcon>;
export const TimeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.6"/><path d="M12 6v6l4 2" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const CinematicIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor"/><path d="M7 6v12M17 6v12" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const RealisticIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="4" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const AnimatedIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.6"/><path d="M9 12l2 2 4-4" stroke="currentColor"/></DuotoneIcon>;
export const HyperlapseIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;
export const BrazilFlagIcon: React.FC<{ className?: string }> = ({ className }) => <svg viewBox="0 0 24 24" className={className}><rect width="24" height="16" y="4" fill="#009739" rx="2"/><path d="M12 6l8 4-8 4-8-4z" fill="#fedd00"/><circle cx="12" cy="10" r="2.5" fill="#012169"/></svg>;
export const EnglishFlagIcon: React.FC<{ className?: string }> = ({ className }) => <svg viewBox="0 0 24 24" className={className}><rect width="24" height="16" y="4" fill="white" rx="2"/><path d="M11 4h2v16h-2zM0 11h24v2H0z" fill="#cf142b"/></svg>;
export const SpanishFlagIcon: React.FC<{ className?: string }> = ({ className }) => <svg viewBox="0 0 24 24" className={className}><rect width="24" height="16" y="4" fill="#aa151b" rx="2"/><rect width="24" height="8" y="8" fill="#f1bf00"/></svg>;
export const WrenchIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M23 4v6h-6M1 20v-6h6" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const EyedropperIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M11 15l1.5 1.5L22 7l-4.5-4.5L8 12l1.5 1.5" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M11 15l-6 6h-3v-3l6-6" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const CpuIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity="0.4"/><path d="M9 9h6v6H9z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const MapIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" opacity="0.6"/><path d="M8 2v16M16 6v16" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const SpeakerLoudIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const CameraFlipIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" opacity="0.6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
