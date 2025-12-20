
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

// Base wrapper for duotone icons
const DuotoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, className, viewBox = "0 0 24 24", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Gradients are defined globally in index.html */}
        {children}
    </svg>
);

// NOVA LOGO: Prisma Luminescente
// Um design hexagonal facetado que evoca a ideia de refração de luz e cristais de dados.
export const LuminescenceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        {/* Hexagonal Outer Frame */}
        <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke="url(#duotone-gradient)" strokeWidth="2" />
        
        {/* Internal Refraction Lines */}
        <path d="M12 2V12M12 22V12M3.34 7L12 12M20.66 17L12 12M3.34 17L12 12M20.66 7L12 12" stroke="url(#duotone-gradient)" opacity="0.3" />
        
        {/* Central AI Star - The Core */}
        <path d="M12 7.5L13.2 10.8L16.5 12L13.2 13.2L12 16.5L10.8 13.2L7.5 12L10.8 10.8L12 7.5Z" fill="url(#duotone-gradient)" stroke="none" />
        
        {/* Glowing Accents */}
        <circle cx="12" cy="2" r="1" fill="url(#duotone-gradient)" stroke="none" />
        <circle cx="12" cy="22" r="1" fill="url(#duotone-gradient)" stroke="none" />
    </DuotoneIcon>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 14.89V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.11" stroke="currentColor" opacity="0.5"/>
        <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#duotone-gradient)" stroke="none"/>
        <path d="M19 3l1 2.5L22.5 6.5 20 7.5 19 10l-1-2.5L15.5 6.5 18 5.5 19 3z" fill="currentColor" opacity="0.4" stroke="none" />
    </DuotoneIcon>
);

export const EnhanceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" opacity="0.2" />
        <path d="M12 8v8M8 12h8" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M18.36 5.64l-1.41 1.41M7.05 16.95l-1.41 1.41M18.36 16.95l-1.41-1.41M7.05 5.64l-1.41-1.41" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M18 2L22 6" stroke="currentColor" opacity="0.4" />
        <path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22l5.5-1.5z" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
        <path d="M15 2l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z" fill="currentColor" stroke="none" opacity="0.6" />
    </DuotoneIcon>
);

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M23 7l-7 5 7 5V7z" stroke="url(#duotone-gradient)" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" />
        <circle cx="8" cy="12" r="2" fill="url(#duotone-gradient)" stroke="none" opacity="0.6" />
    </DuotoneIcon>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="url(#duotone-gradient)" />
        <path d="M7 3h10" stroke="currentColor" opacity="0.5" />
    </DuotoneIcon>
);

export const UpscaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 21l-6-6" stroke="currentColor" opacity="0.5"/>
        <path d="M3 10V3h7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M21 10V3h-7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3 14v7h7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" />
    </DuotoneIcon>
);

export const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M8 8h8v8H8z" stroke="currentColor" opacity="0.2" />
    </DuotoneIcon>
);

export const AddProductIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 5v14M5 12h14" stroke="url(#duotone-gradient)" strokeWidth="2.5" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" opacity="0.3" />
    </DuotoneIcon>
);

export const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 9h12a6 6 0 1 1 0 12h-3" stroke="currentColor" strokeOpacity="0.5"/>
        <path d="M7 13L3 9l4-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 9H9a6 6 0 1 0 0 12h3" stroke="currentColor" strokeOpacity="0.5"/>
        <path d="M17 13l4-4-4-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 8v4l3 3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" stroke="currentColor" opacity="0.6"/>
    </DuotoneIcon>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" opacity="0.4"/>
        <circle cx="12" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/>
        <path d="M12 16v-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M12 8h.01" stroke="url(#duotone-gradient)" strokeWidth="3" strokeLinecap="round" />
    </DuotoneIcon>
);

export const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="currentColor" opacity="0.4"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" opacity="0.4"/>
        <path d="M11 8v6M8 11h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="currentColor" opacity="0.4"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" opacity="0.4"/>
        <path d="M8 11h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const FitToScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" opacity="0.4"/>
    </DuotoneIcon>
);

export const CenterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/>
        <path d="M12 7v3M12 14v3M7 12h3M14 12h3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ActualSizeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity="0.4"/>
        <path d="M9 12h6M12 9v6" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const RotateLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M2.5 2v6h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M2.5 8a10 10 0 1 1 5-8.66" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const RotateRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21.5 2v6h-6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M21.5 8a10 10 0 1 0-5-8.66" stroke="currentColor" opacity="0.6" />
    </DuotoneIcon>
);

export const FlipHorizontalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2v20" stroke="currentColor" strokeDasharray="3 3" opacity="0.4" />
        <path d="M18 15l3-3-3-3v6zM6 15l-3-3 3-3v6z" fill="url(#duotone-gradient)" stroke="none" />
    </DuotoneIcon>
);

export const FlipVerticalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M2 12h20" stroke="currentColor" strokeDasharray="3 3" opacity="0.4" />
        <path d="M9 18l3 3 3-3H9zM9 6l3-3 3 3H9z" fill="url(#duotone-gradient)" stroke="none" />
    </DuotoneIcon>
);

export const GifIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" opacity="0.4" />
        <path d="M7 10h3v4H7zM14 10h3v4h-3z" stroke="url(#duotone-gradient)" />
        <path d="M11 10v4" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 4v6h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" opacity="0.6"/>
    </DuotoneIcon>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" opacity="0.5"/>
        <path d="M7 10l5 5 5-5M12 15V3" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" opacity="0.5"/>
        <path d="M17 21v-8H7v8M7 3v5h8" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" opacity="0.5" />
    </DuotoneIcon>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4" />
        <path d="M12 6v6l4 2" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" opacity="0.4"/>
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const EraserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M7 21L2.7 16.7a1 1 0 0 1 0-1.4l11-11a1 1 0 0 1 1.4 0l7.2 7.2a1 1 0 0 1 0 1.4L15 20.3a1 1 0 0 1-1.4 0L11 17.7M7 21h10" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
        <path d="M11 17.7L7 21" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const PaintBrushIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M18 2L22 6" stroke="currentColor" opacity="0.4" />
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
        <path d="M3 21l18-18" stroke="currentColor" opacity="0.2" strokeDasharray="4 4" />
        <path d="M15 15l6 6" stroke="currentColor" opacity="0.4"/>
        <rect x="7" y="7" width="10" height="10" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const CardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" opacity="0.4"/>
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
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="url(#duotone-gradient)" strokeWidth="2" strokeLinecap="round"/>
    </DuotoneIcon>
);

export const RetouchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 21a9 9 0 1 0-9-9c0 4.97 4.03 9 9 9z" stroke="currentColor" opacity="0.3"/>
        <path d="M12 8v8M8 12h8" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const ProductIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" opacity="0.4"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const CropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M6 1v15a2 2 0 0 0 2 2h15" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M1 6l15-1a2 2 0 0 1 2 2v15" stroke="currentColor" opacity="0.4"/>
    </DuotoneIcon>
);

export const CropAutoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M3 9V5a2 2 0 0 1 2-2h4M17 3h2a2 2 0 0 1 2 2v4" stroke="currentColor" opacity="0.4"/>
        <rect x="7" y="8" width="10" height="8" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const AdjustIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 14h6M9 8h6M17 16h6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const GalleryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" opacity="0.4"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M21 15l-5-5L5 21" stroke="url(#duotone-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
    </DuotoneIcon>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M12 5v14m7-7l-7 7-7-7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
  </DuotoneIcon>
);

export const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 19V5m-7 7l7-7 7 7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M19 12H5m7 7l-7-7 7-7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M5 12h14m-7-7l7 7-7 7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ArrowLeftFromLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 12h18" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3 6h18M3 18h18" stroke="currentColor" opacity="0.4"/>
        <path d="M9 16l-4-4 4-4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ArrowRightFromLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 12h18" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M3 6h18M3 18h18" stroke="currentColor" opacity="0.4"/>
        <path d="M15 8l4 4-4 4" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" opacity="0.4"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const LayersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const VariationsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="7" height="7" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" opacity="0.4" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" opacity="0.4" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const NoSymbolIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/>
        <path d="M4.93 4.93l14.14 14.14" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const CircuitBoardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" opacity="0.2"/>
        <path d="M6 9h4l2 3h6M6 15h4l2-3h6" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
        <circle cx="6" cy="9" r="1" fill="currentColor"/>
        <circle cx="18" cy="12" r="1" fill="currentColor"/>
        <circle cx="6" cy="15" r="1" fill="currentColor"/>
    </DuotoneIcon>
);

export const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" opacity="0.4"/>
        <rect x="14" y="3" width="7" height="7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" opacity="0.4"/>
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" opacity="0.4"/>
    </DuotoneIcon>
);

export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const CpuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity="0.4"/>
        <path d="M9 9h6v6H9V9z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" stroke="currentColor" opacity="0.2"/>
    </DuotoneIcon>
);

export const WrenchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C22 6 17.5 2 12 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <circle cx="7.5" cy="10.5" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="10.5" cy="7.5" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="13.5" cy="7.5" r="1" fill="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

export const EnglishFlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}><path d="M0 0h5v3H0z" fill="#fff"/><path d="M2 0h1v3H2zM0 1h5v1H0z" fill="#D80027"/></svg>
);

export const BrazilFlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}>
        <path d="M0 0h5v3H0z" fill="#009B3A"/>
        <path d="M2.5 1.5 4.5.37v2.26L2.5 1.5zm0 0L.5.37v2.26L2.5 1.5z" fill="#FFCC29"/>
        <circle cx="2.5" cy="1.5" r=".42" fill="#002776"/>
    </svg>
);

export const SpanishFlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}>
        <path d="M0 0h5v3H0z" fill="#C60B1E"/>
        <path d="M0 .75h5v1.5H0z" fill="#FFC400"/>
    </svg>
);

export const QuestionMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="url(#duotone-gradient)" strokeWidth="2" strokeLinecap="round"/>
    </DuotoneIcon>
);

export const HandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M18 11V6a2 2 0 0 0-2-2M14 10V4a2 2 0 0 0-2-2M10 10.5V6a2 2 0 0 0-2-2" stroke="currentColor" opacity="0.4"/>
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-3.6-3-6l2-3" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" opacity="0.4"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const StyleTransferIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" opacity="0.2" strokeDasharray="2 2" />
        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const CaptionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" opacity="0.4"/>
        <path d="M8 9h8M8 13h5" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const EyedropperIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M11 15.5l-9.5 9.5 5.5-11 4 1.5z" stroke="currentColor" opacity="0.4"/>
        <path d="M17.5 12.5L2 22l9.5-15.5 6 6z" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M14 7l7-7 3 3-7 7" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const MicrophoneOnIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" opacity="0.4"/>
        <path d="M12 19v4M8 23h8" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const MicrophoneOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" opacity="0.3"/>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const SpeakerLoudIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" opacity="0.4"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" opacity="0.4"/>
        <path d="M8 2v16M16 6v16" stroke="url(#duotone-gradient)" strokeWidth="1.5" />
    </DuotoneIcon>
);

export const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" opacity="0.4"/>
        <circle cx="12" cy="5" r="2" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <path d="M12 7v4M8 16h.01M16 16h.01" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const FocusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" opacity="0.4"/>
    </DuotoneIcon>
);

export const MergeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 16l4-4M16 8l4-4" stroke="currentColor" opacity="0.3"/>
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

// Generic filter icons optimized
export const ArtDecoIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L4 8v8l8 6 8-6V8l-8-6z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 2v20M4 8l16 8M4 16l16-8" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const SynthwaveIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M2 12h20M12 2v20M6 18l12-12" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const AnimeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7z" fill="url(#duotone-gradient)" stroke="none"/><path d="M12 2v20M2 12h20" stroke="currentColor" opacity="0.2"/></DuotoneIcon>;
export const LomoIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.2"/><circle cx="12" cy="12" r="6" stroke="url(#duotone-gradient)" strokeWidth="2.5"/></DuotoneIcon>;
export const CyberpunkIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="18" height="18" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const FilmNoirIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2A10 10 0 1 0 12 22V2z" fill="url(#duotone-gradient)" stroke="none"/><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const WatercolorIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2c4.4 0 8 3.6 8 8 0 5.4-8 12-8 12S4 15.4 4 10c0-4.4 3.6-8 8-8z" stroke="url(#duotone-gradient)" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const VintageIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M8 3v18M16 3v18M3 8h18M3 16h18" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const SteampunkIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="9" stroke="currentColor" opacity="0.2"/><circle cx="12" cy="12" r="4" stroke="url(#duotone-gradient)" strokeWidth="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="url(#duotone-gradient)"/></DuotoneIcon>;
export const ClaymationIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" stroke="url(#duotone-gradient)" strokeWidth="2.5"/><circle cx="12" cy="12" r="4" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const BlueprintIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="18" height="18" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M3 12h18M12 3v18M7 3v18M17 3v18M3 7h18M3 17h18" stroke="currentColor" strokeDasharray="1 3" opacity="0.4"/></DuotoneIcon>;
export const ComicBookIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2v20M2 12h20M2 2l20 20M2 22L22 2" stroke="currentColor" opacity="0.2"/><rect x="3" y="3" width="18" height="18" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const InfraredIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 2v20M2 12h20" stroke="currentColor" opacity="0.3" strokeDasharray="3 3"/></DuotoneIcon>;
export const PixelArtIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zm-12 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zm-12 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;

export const BladeRunnerIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 21h18M5 21V11l7-8 7 8v10" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 3v18" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const WesAndersonIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M3 12h18M12 3v18" stroke="currentColor" opacity="0.5"/></DuotoneIcon>;
export const MadMaxIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="9" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 3v18M3 12h18" stroke="currentColor" opacity="0.3"/><path d="M9 10l6 4m-6 0l6-4" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const AmelieIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;

export const GoldenHourIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2v6m6-2l-2 3M6 6l2 3M21 12H3" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M3 12a9 9 0 0 0 18 0" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const MonochromeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.4"/><path d="M12 2a10 10 0 0 0 0 20V2z" fill="url(#duotone-gradient)" stroke="none"/></DuotoneIcon>;
export const SketchIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M17 3l4 4-14 14H3v-4L17 3z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M16 5l3 3" stroke="currentColor" opacity="0.5"/></DuotoneIcon>;
export const OrigamiIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 20L12 10L22 20L12 18L2 20z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 10L20 4l-6 4L12 10zm0 0L4 4l6 4 2 2z" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const UkiyoeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 18c0-4 4-8 10-8s10 4 10 8" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M2 14c0-4 4-8 10-8s10 4 10 8" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const VanGoghIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" stroke="url(#duotone-gradient)" strokeWidth="1.5"/><path d="M12 6c-2.5 0-4.5 2-4.5 4.5S9.5 15 12 15s4.5 2 4.5 4.5" stroke="currentColor" opacity="0.5" strokeLinecap="round"/></DuotoneIcon>;
export const GhibliIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4.5 16c-1-2-1.5-4 .5-6 2-2 4-1 5 1m3 7c0-2 0-5 2-6s4 0 5 2m-12 1c-1-2 0-5 2-6s4-1 5 1" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const DuneIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="16" cy="7" r="4" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M2 20c0-4 4-8 10-8s10 4 10 8" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M10 9a2 2 0 1 0-4 0" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const ArcaneIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2l-8 4v12l8 4 8-4V6l-8-4z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 2v20M4 6l16 12M20 6L4 18" stroke="currentColor" opacity="0.3"/></DuotoneIcon>;
export const SpiderVerseIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="url(#duotone-gradient)" opacity="0.6"/><path d="M12 8l4 4-4 4-4-4 4-4z" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;

export const TimeIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 8v12h20V8l-4-4H6L2 8z" stroke="url(#duotone-gradient)" strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke="currentColor" opacity="0.6"/><circle cx="18" cy="7" r="1.5" fill="currentColor" /></DuotoneIcon>;
export const CinematicIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="5" width="20" height="14" rx="2" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M2 9h20M2 15h20" stroke="currentColor" opacity="0.5"/></DuotoneIcon>;
export const RealisticIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M7 14l3-3 2.5 2.5 2-3 2.5 3.5" stroke="currentColor" opacity="0.6"/></DuotoneIcon>;
export const AnimatedIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" stroke="url(#duotone-gradient)" strokeWidth="2.5"/></DuotoneIcon>;
export const HyperlapseIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 12h4l3-9 4 18 3-9h4" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;

export const BokehIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="8" cy="8" r="4" fill="url(#duotone-gradient)" fillOpacity="0.5" stroke="none"/><circle cx="16" cy="10" r="6" fill="url(#duotone-gradient-alt)" fillOpacity="0.5" stroke="none"/><circle cx="12" cy="18" r="3" fill="url(#duotone-gradient)" fillOpacity="0.5" stroke="none"/></DuotoneIcon>;
export const LightLeakIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" opacity="0.3"/><path d="M2 7l20 10M2 12l20 10" stroke="url(#duotone-gradient)" strokeWidth="4" opacity="0.6"/></DuotoneIcon>;
export const Anaglyph3DIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="4" y="4" width="15" height="15" rx="1" stroke="#0ff" opacity="0.7"/><rect x="6" y="6" width="15" height="15" rx="1" stroke="#f00" opacity="0.7"/></DuotoneIcon>;

export const HDRIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M3 12h18M12 3v18" stroke="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="6" stroke="url(#duotone-gradient)" strokeWidth="2.5"/></DuotoneIcon>;
export const StudioLightIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L8 22h8L12 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/><ellipse cx="12" cy="22" rx="6" ry="2" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const ClarifyIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M2 12l5 5L22 3" stroke="url(#duotone-gradient)" strokeWidth="2.5"/><path d="M22 11l-5 5-3-3" stroke="currentColor" opacity="0.4"/></DuotoneIcon>;
export const VibranceIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 3v18M3 12h18" stroke="currentColor" opacity="0.2"/><path d="M4.2 4.2l15.6 15.6M19.8 4.2L4.2 19.8" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const SoftGlowIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="12" cy="12" r="8" stroke="url(#duotone-gradient)" strokeDasharray="3 6"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.2" stroke="none"/></DuotoneIcon>;

export const NeonIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2L2 22h20L12 2z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M12 8v8" stroke="currentColor" opacity="0.6" strokeWidth="2"/></DuotoneIcon>;
export const PastelIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><circle cx="8" cy="8" r="5" stroke="url(#duotone-gradient)" strokeWidth="2"/><circle cx="16" cy="16" r="5" stroke="url(#duotone-gradient-alt)" strokeWidth="2"/></DuotoneIcon>;
export const CharcoalIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M4 4l16 16M4 20L20 4" stroke="currentColor" opacity="0.3"/><rect x="4" y="4" width="16" height="16" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const OilPaintIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" stroke="url(#duotone-gradient)" strokeWidth="2"/><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" opacity="0.4" strokeWidth="2"/></DuotoneIcon>;
export const MosaicIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><rect x="4" y="4" width="6" height="6" stroke="url(#duotone-gradient)" strokeWidth="2"/><rect x="14" y="4" width="6" height="6" stroke="currentColor" opacity="0.3"/><rect x="4" y="14" width="6" height="6" stroke="currentColor" opacity="0.3"/><rect x="14" y="14" width="6" height="6" stroke="url(#duotone-gradient)" strokeWidth="2"/></DuotoneIcon>;
export const PsychedelicIcon: React.FC<{ className?: string }> = ({ className }) => <DuotoneIcon className={className}><path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="url(#duotone-gradient)" strokeWidth="1.5"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" opacity="0.5"/></DuotoneIcon>;

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" opacity="0.5" />
    </DuotoneIcon>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M22 11v1a10 10 0 1 1-5.93-9.14" stroke="currentColor" opacity="0.5" />
        <path d="M22 4L12 14l-3-3" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const InvertIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="currentColor" opacity="0.3" />
        <path d="M3 12h18" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 0 0 20z" fill="url(#duotone-gradient)" stroke="none" opacity="0.2" />
    </DuotoneIcon>
);

export const CameraFlipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M20 10a8 8 0 1 0-8 8" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M20 14v-4h-4" stroke="currentColor" opacity="0.6" strokeWidth="2" />
    </DuotoneIcon>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="18" cy="5" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <circle cx="6" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <circle cx="18" cy="19" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" opacity="0.5" />
    </DuotoneIcon>
);

// FIX: Added missing icons used in various panels and data files.
export const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 3v18M3 12h18" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.3" />
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#duotone-gradient)" stroke="none"/>
    </DuotoneIcon>
);

export const GlitchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 7h18M5 12h14M3 17h18" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M2 5h2M20 5h2M2 19h2M20 19h2" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const PopArtIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="8" height="8" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" opacity="0.4" />
        <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" opacity="0.4" />
        <rect x="13" y="13" width="8" height="8" rx="1" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const GouacheIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C22 6 17.5 2 12 2z" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.4"/>
        <path d="M18 10l-6 6M12 10l6 6" stroke="url(#duotone-gradient)" strokeWidth="2"/>
    </DuotoneIcon>
);

export const DoubleExposureIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="9" cy="12" r="6" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <circle cx="15" cy="12" r="6" stroke="currentColor" opacity="0.5" strokeWidth="2" />
    </DuotoneIcon>
);

export const LongExposureIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" opacity="0.3" />
        <path d="M12 7v5l3 2" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M20 12c0 4.4-3.6 8-8 8" stroke="url(#duotone-gradient)" strokeWidth="2" opacity="0.6" />
    </DuotoneIcon>
);

export const TiltShiftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 6h18M3 18h18" stroke="currentColor" opacity="0.4" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const SolarizedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="5" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" opacity="0.5" />
    </DuotoneIcon>
);

export const ArtNouveauIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 22c0-5.5 4.5-10 10-10M2 12c5.5 0 10-4.5 10-10" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" opacity="0.4" />
    </DuotoneIcon>
);

export const RevolutionaryPropagandaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" fill="url(#duotone-gradient)" stroke="none" />
        <path d="M2 22L22 2" stroke="currentColor" opacity="0.3" strokeWidth="4" />
    </DuotoneIcon>
);

export const CorporateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity="0.4" />
        <circle cx="12" cy="10" r="3" stroke="url(#duotone-gradient)" strokeWidth="2" />
        <path d="M6 18c0-2 2-4 6-4s6 2 6 4" stroke="url(#duotone-gradient)" strokeWidth="2" />
    </DuotoneIcon>
);

export const PunkRockCollageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M5 5l14 14M5 19L19 5" stroke="url(#duotone-gradient)" strokeWidth="3" />
        <path d="M12 3v18M3 12h18" stroke="currentColor" opacity="0.3" strokeWidth="1" />
    </DuotoneIcon>
);

export const MinimalistFreedomIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="1" fill="url(#duotone-gradient)" stroke="none" />
        <path d="M12 2v20" stroke="currentColor" opacity="0.1" />
    </DuotoneIcon>
);

export const RoyalRegaliaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M5 15l-3-7 5 2 5-7 5 7 5-2-3 7H5z" stroke="url(#duotone-gradient)" strokeWidth="2" fill="url(#duotone-gradient)" fillOpacity="0.1" />
        <path d="M2 18h20" stroke="currentColor" opacity="0.4" strokeWidth="2" />
    </DuotoneIcon>
);

export const MatrixIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2v20M7 4v16M17 4v16M2 8v8M22 8v8" stroke="url(#duotone-gradient)" strokeWidth="1.5" opacity="0.4" />
        <circle cx="12" cy="6" r="1" fill="url(#duotone-gradient)" />
        <circle cx="12" cy="12" r="1" fill="url(#duotone-gradient)" />
        <circle cx="12" cy="18" r="1" fill="url(#duotone-gradient)" />
    </DuotoneIcon>
);
