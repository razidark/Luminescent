
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';

// Base wrapper for duotone icons
// FIX: Modified the DuotoneIcon component to accept and spread additional SVG props, resolving type errors for icons that pass props like `fill` and `stroke`.
const DuotoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, className, viewBox = "0 0 24 24", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <defs>
            <linearGradient id="duotone-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-gradient-from)" />
                <stop offset="100%" stopColor="var(--theme-gradient-to)" />
            </linearGradient>
            <linearGradient id="duotone-gradient-alt" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--theme-gradient-from)" />
                <stop offset="100%" stopColor="var(--theme-gradient-to)" />
            </linearGradient>
        </defs>
        {children}
    </svg>
);


export const LuminescenceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 8.5C4 6.01472 6.01472 4 8.5 4H15.5C17.9853 4 20 6.01472 20 8.5V15.5C20 17.9853 17.9853 20 15.5 20H8.5C6.01472 20 4 17.9853 4 15.5V8.5Z" stroke="url(#duotone-gradient)" />
        <circle cx="12" cy="12" r="4" stroke="url(#duotone-gradient)" />
        <path d="M19 3L21 5L19 7" stroke="url(#duotone-gradient)" />
        <path d="M16 4L17 5L16 6" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path opacity="0.5" d="M21 15V18.75C21 19.9926 20.0123 21 18.75 21H5.25C4.00736 21 3 19.9926 3 18.75V15" stroke="currentColor"/>
        <path d="M17 8L12 3L7 8M12 3V15" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path opacity="0.5" d="M12 2V5M12 19V22M22 12H19M5 12H2" stroke="currentColor"/>
        <path d="M18.364 5.63604L16.2427 7.75736M7.75739 16.2426L5.63607 18.364M18.364 18.364L16.2427 16.2426M7.75739 7.75736L5.63607 5.63604" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className} fill="currentColor" stroke="none">
        <path opacity="0.5" d="M18 9.75a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.008ZM19.5 7.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.008ZM21 5.25a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75h.008Z" />
        <path d="M3 21L12 12L14.5 14.5L15.5 13.5L13.5 11.5L21 3" stroke="url(#duotone-gradient)" strokeWidth="1.5" fill="none"/>
    </DuotoneIcon>
);

export const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => <SparkleIcon className={className} />;

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className} fill="currentColor" stroke="currentColor">
        <path opacity="0.5" d="M22 8L18 10L22 12V8Z" />
        <path d="M15 5.25H4.5C3.40294 5.25 2.5 6.15294 2.5 7.25V16.75C2.5 17.8471 3.40294 18.75 4.5 18.75H15C16.1046 18.75 17 17.8471 17 16.75V7.25C17 6.15294 16.1046 5.25 15 5.25Z" stroke="url(#duotone-gradient)" fill="none"/>
    </DuotoneIcon>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path opacity="0.5" d="M4 14C4 14 6 11 12 11C18 11 20 14 20 14" stroke="currentColor"/>
        <path d="M4 6H20M7 11H17M10 16H14" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const UpscaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path opacity="0.5" d="M15 9L20 4M20 4V8M20 4H16" stroke="currentColor"/>
        <path d="M4 20L9 15M4 20H8M4 20V16" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 9V3H15M3 15V21H9M15 3L21 3L21 9M9 21H3L3 15" stroke="currentColor" strokeOpacity="0.5"/>
        <path d="M8 11V8H11M16 13V16H13M11 8L4 4M13 16L20 20" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const AddProductIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.5" />
        <path d="M12 7V17M7 12H17" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);


export const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 9H15C18.3137 9 21 11.6863 21 15C21 18.3137 18.3137 21 15 21H12" stroke="currentColor" strokeOpacity="0.5"/>
        <path d="M7 13L3 9L7 5" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 9H9C5.68629 9 3 11.6863 3 15C3 18.3137 5.68629 21 9 21H12" stroke="currentColor" strokeOpacity="0.5"/>
        <path d="M17 13L21 9L17 5" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" opacity="0.5"/>
        <path d="M12 7V12L15 13.5" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" opacity="0.5"/>
        <circle cx="12" cy="12" r="3" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="currentColor" opacity="0.5"/>
        <path d="M21 21L16.65 16.65M11 8V14M8 11H14" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="11" cy="11" r="8" stroke="currentColor" opacity="0.5"/>
        <path d="M21 21L16.65 16.65M8 11H14" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const FitToScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" stroke="currentColor" opacity="0.5"/>
        <path d="M10 14L7 17M14 10L17 7M7 10L10 7M17 14L14 17" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ActualSizeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" opacity="0.5"/>
        <path d="M10 10H14V14H10V10Z" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const RotateLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12" stroke="currentColor" opacity="0.5" />
        <path d="M3 12L7 8M3 12L7 16" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const RotateRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12" stroke="currentColor" opacity="0.5" />
        <path d="M21 12L17 8M21 12L17 16" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const FlipHorizontalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 4V20" stroke="currentColor" strokeDasharray="4 4" opacity="0.5" />
        <path d="M17 14L20 12L17 10V14Z" stroke="url(#duotone-gradient)" />
        <path d="M7 14L4 12L7 10V14Z" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const FlipVerticalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 12H20" stroke="currentColor" strokeDasharray="4 4" opacity="0.5" />
        <path d="M10 7L12 4L14 7H10Z" stroke="url(#duotone-gradient)" />
        <path d="M10 17L12 20L14 17H10Z" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const GifIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" opacity="0.5" />
        <path d="M8 13V11C8 10.4477 8.44772 10 9 10H10M8 13V14C8 14.5523 8.44772 15 9 15H10M8 13H9.5" stroke="url(#duotone-gradient)" />
        <path d="M12 10V15" stroke="url(#duotone-gradient)" />
        <path d="M15 10V15M15 10H17M15 13H16.5" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const ResetIcon: React.FC<{ className?: string }> = ({ className }) => <HistoryIcon className={className}/>;

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path opacity="0.5" d="M3 15V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V15" stroke="currentColor"/>
        <path d="M12 3V15M12 15L16 11M12 15L8 11" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" opacity="0.5"/>
        <path d="M8 6H16V11H8V6ZM8 15V21H16V15H8Z" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 20H21M5 20H9.5M18.5 5.08579C19.8807 6.46646 19.8807 8.76676 18.5 10.1474L10.1474 18.5C8.76676 19.8807 6.46646 19.8807 5.08579 18.5C3.70513 17.1193 3.70513 14.819 5.08579 13.4384L13.4384 5.08579C14.819 3.70513 17.1193 3.70513 18.5 5.08579Z" stroke="currentColor" opacity="0.5"/>
        <path d="M17 6.5L12 11.5" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const PaintBrushIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M16 3L18 5L10 13L6 13L6 9L14 1L16 3Z" stroke="currentColor" opacity="0.5"/>
        <path d="M14.5 4.5L17.5 7.5M9 12V21H18V18" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const RemoveBgIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M20 16L12 8L4 16" stroke="currentColor" opacity="0.5"/>
        <path d="M20 8L12 16L4 8" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const CardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" opacity="0.5"/>
        <path d="M8 8H12M8 12H16" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const TextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 4V7M4 7H10M4 7H7" stroke="currentColor" opacity="0.5"/>
        <path d="M7 20V4M7 20H10M7 20H4" stroke="currentColor" opacity="0.5"/>
        <path d="M14 20V12M14 12H17.5M14 12H21" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const MemeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className} fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.5"/>
        <path d="M9 15C9.85038 16.2831 10.8846 17 12 17C13.1154 17 14.1496 16.2831 15 15" stroke="url(#duotone-gradient)"/>
        <path d="M8.5 9.5C8.5 9.77614 8.72386 10 9 10C9.27614 10 9.5 9.77614 9.5 9.5C9.5 9.22386 9.27614 9 9 9C8.72386 9 8.5 9.22386 8.5 9.5ZM14.5 9.5C14.5 9.77614 14.7239 10 15 10C15.2761 10 15.5 9.77614 15.5 9.5C15.5 9.22386 15.2761 9 15 9C14.7239 9 14.5 9.22386 14.5 9.5Z" fill="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const RetouchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" opacity="0.5"/>
        <path d="M12 8L12 16M16 12L8 12" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ProductIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M5 8V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8" stroke="currentColor" opacity="0.5"/>
        <path d="M3 12L5 8L19 8L21 12H3Z" stroke="url(#duotone-gradient)"/>
        <path d="M14 12V8M10 12V8" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const CropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M21 16V18C21 19.6569 19.6569 21 18 21H6" stroke="currentColor" opacity="0.5"/>
        <path d="M8 3H6C4.34315 3 3 4.34315 3 6V16" stroke="url(#duotone-gradient)"/>
        <path d="M21 3H8V16H21V3Z" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const AdjustIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14H7M9 8H15M17 16H23" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const GalleryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" opacity="0.5"/>
        <path d="M7 14L10 11L12.5 13.5L14.5 10.5L17 14" stroke="url(#duotone-gradient)"/>
        <circle cx="8" cy="8" r="1" fill="url(#duotone-gradient-alt)" stroke="none"/>
    </DuotoneIcon>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="currentColor" opacity="0.5"/>
        <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor"/>
  </DuotoneIcon>
);

export const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 20V4M12 4L18 10M12 4L6 10" stroke="currentColor"/>
    </DuotoneIcon>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="currentColor"/>
    </DuotoneIcon>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor"/>
    </DuotoneIcon>
);

export const ArrowLeftFromLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="url(#duotone-gradient)"/>
        <path d="M20 4V20" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const ArrowRightFromLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="url(#duotone-gradient)"/>
        <path d="M4 4V20" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M4 19.5C4 18.8 4 17.4 5.7 17C8.3 16.4 12 16.4 12 16.4V4.5C12 4.5 8.2 4.4 5.5 5C4.2 5.3 4 6.4 4 7.3V19.5Z" stroke="url(#duotone-gradient)" />
        <path d="M20 19.5C20 18.8 20 17.4 18.3 17C15.7 16.4 12 16.4 12 16.4V4.5C12 4.5 15.8 4.4 18.5 5C19.8 5.3 20 6.4 20 7.3V19.5Z" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const LayersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M2 17L12 22L22 17" stroke="currentColor" opacity="0.5"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" opacity="0.5"/>
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const VariationsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M14 3H5C3.89543 3 3 3.89543 3 5V14" stroke="currentColor" opacity="0.5"/>
        <path d="M19 8H10C8.89543 8 8 8.89543 8 10V19C8 20.1046 8.89543 21 10 21H19C20.1046 21 21 20.1046 21 19V10C21 8.89543 20.1046 8 19 8Z" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const NoSymbolIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.5"/>
        <path d="M5 19L19 5" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const CircuitBoardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" opacity="0.5"/>
        <circle cx="9" cy="9" r="2" stroke="url(#duotone-gradient)"/>
        <path d="M11 9H14M14 9V12M14 9V6" stroke="currentColor" opacity="0.5"/>
        <path d="M9 11V15H15V13" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 10H21M3 14H21M10 3V21M14 3V21" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M9 4L3 10V14L9 20" stroke="currentColor" opacity="0.5"/>
        <path d="M15 4L21 10V14L15 20" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const CpuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity="0.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="url(#duotone-gradient)"/>
        <path d="M9 1V4M15 1V4M9 20V23M15 20V23M20 9H23M20 15H23M1 9H4M1 15H4" stroke="currentColor" strokeLinecap="round"/>
    </DuotoneIcon>
);

export const WrenchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5" stroke="currentColor" opacity="0.5"/>
        <path d="M12 5L17.6569 10.6569C19.219 12.219 19.219 14.781 17.6569 16.3431L16.3431 17.6569C14.781 19.219 12.219 19.219 10.6569 17.6569L5 12" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" opacity="0.5"/>
        <path d="M12 3V21" stroke="url(#duotone-gradient)"/>
        <path d="M3 12C3 16.9706 7.02944 21 12 21" stroke="url(#duotone-gradient)"/>
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
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.5"/>
        <path d="M12 17V17.01" stroke="url(#duotone-gradient)" />
        <path d="M12 13.5C12 11.5 14 10.5 14 9C14 7.5 12.5 7 12 7C11.5 7 10 7.5 10 9" stroke="url(#duotone-gradient)" />
    </DuotoneIcon>
);

export const HandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M5 14.5V10.5C5 9.39543 5.89543 8.5 7 8.5C8.10457 8.5 9 9.39543 9 10.5V15.5" stroke="currentColor" opacity="0.5"/>
        <path d="M9 11.5V6.5C9 5.39543 9.89543 4.5 11 4.5C12.1046 4.5 13 5.39543 13 6.5V15.5" stroke="url(#duotone-gradient)"/>
        <path d="M13 8.5V4.5C13 3.39543 13.8954 2.5 15 2.5C16.1046 2.5 17 3.39543 17 4.5V15M17 15C17 17.7614 14.7614 20 12 20C9.23858 20 7 17.7614 7 15" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" opacity="0.5"/>
        <path d="M12 21C12 21 9 18 9 12C9 6 12 3 12 3" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const StyleTransferIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 2L12 22M2 12H22" stroke="currentColor" opacity="0.5"/>
        <circle cx="12" cy="12" r="4" stroke="url(#duotone-gradient)"/>
        <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="url(#duotone-gradient-alt)"/></DuotoneIcon>
);

export const CaptionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" opacity="0.5"/>
        <path d="M7 9H17M7 13H11" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const EyedropperIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M15.465 4.535L19.465 8.535C20.636 9.707 20.636 11.623 19.465 12.794L12.794 19.465C11.623 20.636 9.707 20.636 8.535 19.465L4.535 15.465" stroke="url(#duotone-gradient)"/>
        <path d="M12.5 11.5L2 22M15 15L17.5 12.5" stroke="currentColor" opacity="0.5"/>
        <path d="M8.5 8.5L3 14" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.9626 20 9.96346 19.8599 9.02472 19.6002L4 21L5.20836 16.7709C4.44824 15.9971 4 15.0398 4 14C4 9.58172 8.02944 6 12 6C16.9706 6 21 9.58172 21 12Z" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const MicrophoneOnIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M12 1V15M12 15C8.68629 15 6 12.3137 6 9M12 15C15.3137 15 18 12.3137 18 9" stroke="currentColor" strokeOpacity="0.5"/>
        <rect x="9" y="1" width="6" height="12" rx="3" stroke="url(#duotone-gradient)"/>
        <path d="M12 19V22M8 22H16" stroke="url(#duotone-gradient)"/>
    </DuotoneIcon>
);

export const MicrophoneOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M1 1L23 23" stroke="currentColor"/>
        <path d="M9 5.00001C9 3.34316 10.3431 2.00001 12 2.00001C13.6569 2.00001 15 3.34316 15 5.00001V9.00001M15 13V14C15 15.6569 13.6569 17 12 17C10.9649 17 10.0471 16.475 9.4996 15.676" stroke="url(#duotone-gradient)"/>
        <path d="M19 10V14C19 14.6638 18.8198 15.2851 18.503 15.8205M5 10V14C5 17.866 8.13401 21 12 21C13.3527 21 14.616 20.6167 15.685 19.9511M12 21V24M8 24H16" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const SpeakerLoudIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
         <path d="M6 9H2L2 15H6L11 20V4L6 9Z" stroke="url(#duotone-gradient)"/>
         <path d="M15.5 12C15.5 10 16.5 8.5 18 7.5M19 16C19 14 17 12 15.5 12" stroke="currentColor" opacity="0.5"/>
         <path d="M15 5C18 6 21 9 21 12C21 15 18 18 15 19" stroke="currentColor"/>
    </DuotoneIcon>
);

export const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" stroke="url(#duotone-gradient)"/>
        <path d="M9 3V18M15 6V21" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

export const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <DuotoneIcon className={className}>
        <rect x="4" y="8" width="16" height="12" rx="2" stroke="url(#duotone-gradient)"/>
        <path d="M9 13H10M14 13H15" stroke="currentColor"/>
        <path d="M9 17H15" stroke="currentColor" opacity="0.5"/>
        <path d="M12 8V4M8 4H16" stroke="currentColor" opacity="0.5"/>
        <path d="M2 12H4M20 12H22" stroke="currentColor" opacity="0.5"/>
    </DuotoneIcon>
);

// Generic wrapper for the new set of filter icons
const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <DuotoneIcon className={className} fill="none">{children}</DuotoneIcon>
);

export const ArtDecoIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2L4 8V16L12 22L20 16V8L12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M4 8L12 13L20 8M12 13V22" stroke="currentColor"/></IconWrapper>;
export const ArtNouveauIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M4 4C4 12 12 12 12 12S20 12 20 4" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 12C12 20 4 20 4 20M12 12C12 20 20 20 20 20" stroke="currentColor"/></IconWrapper>;
export const SynthwaveIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M6 18L18 6M3 12H21" stroke="currentColor"/></IconWrapper>;
export const AnimeIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 8V16" stroke="currentColor"/></IconWrapper>;
export const LomoIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><circle opacity="0.5" cx="12" cy="12" r="4" stroke="currentColor"/></IconWrapper>;
export const GlitchIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M6 6H18V18H6V6Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M6 10H9L12 6L15 12L18 10M6 14H9L12 10L15 16L18 14" stroke="currentColor"/></IconWrapper>;
export const CyberpunkIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M3 3H21V21H3V3Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M9 3V9H3M21 9H15V3M3 15H9V21M15 21V15H21" stroke="currentColor"/></IconWrapper>;
export const FilmNoirIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22V2Z" fill="url(#duotone-gradient)" stroke="none"/><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.5"/></IconWrapper>;
export const WatercolorIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2Z" stroke="currentColor"/></IconWrapper>;
export const VintageIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M3 8H21M8 3V21" stroke="currentColor"/></IconWrapper>;
export const PopArtIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><circle opacity="0.5" cx="9" cy="9" r="1" fill="currentColor" stroke="none"/><circle opacity="0.5" cx="15" cy="9" r="1" fill="currentColor" stroke="none"/><circle opacity="0.5" cx="9" cy="15" r="1" fill="currentColor" stroke="none"/><circle opacity="0.5" cx="15" cy="15" r="1" fill="currentColor" stroke="none"/></IconWrapper>;
export const SteampunkIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2V6M12 18V22M22 12H18M6 12H2M19.7782 19.7782L16.9497 16.9497M7.05029 7.05025L4.22183 4.22183M19.7782 4.22183L16.9497 7.05025M7.05029 16.9497L4.22183 19.7782" stroke="url(#duotone-gradient)"/><circle opacity="0.5" cx="12" cy="12" r="3" stroke="currentColor"/></IconWrapper>;
export const ClaymationIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" stroke="currentColor"/></IconWrapper>;
export const BlueprintIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M7 3V21M3 7H21M3 12H21M12 3V21" stroke="currentColor" strokeDasharray="2 2"/></IconWrapper>;
export const ComicBookIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M4 4H20V20H4V4Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M4 12H12M12 4V12L20 20M12 12L20 4" stroke="currentColor"/></IconWrapper>;
export const InfraredIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 2V22M2 12H22" stroke="currentColor" strokeDasharray="2 2"/></IconWrapper>;
export const GouacheIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2V12Z" fill="currentColor" stroke="none"/></IconWrapper>;
export const DoubleExposureIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="4" y="4" width="16" height="16" rx="2" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12" stroke="currentColor"/></IconWrapper>;
export const LongExposureIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M3 12H21" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M3 8H21M3 16H21" stroke="currentColor"/></IconWrapper>;
export const TiltShiftIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M3 8H21M3 16H21" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M3 12H21" stroke="currentColor"/></IconWrapper>;
export const SolarizedIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><path d="M12 2V22" stroke="currentColor" opacity="0.5"/><path d="M21 12C21 16.9706 16.9706 21 12 21" stroke="url(#duotone-gradient)"/></IconWrapper>;
export const PixelArtIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M4 4H8V8H4V4ZM10 4H14V8H10V4ZM16 4H20V8H16V4ZM4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10ZM4 16H8V20H4V16ZM10 16H14V20H10V16ZM16 16H20V20H16V16Z" fill="url(#duotone-gradient)" stroke="none"/></IconWrapper>;
export const RevolutionaryPropagandaIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 2V22" stroke="currentColor"/></IconWrapper>;
export const CorporateIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M7 8V16M12 12V16M17 6V16" stroke="currentColor"/></IconWrapper>;
export const PunkRockCollageIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M4 4H20V20H4V4Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M4 20L20 4M10 20L20 10M4 10L10 4" stroke="currentColor"/></IconWrapper>;
export const MinimalistFreedomIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M3 12H21" stroke="url(#duotone-gradient)"/></IconWrapper>;
export const RoyalRegaliaIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M5 13L2 21H22L19 13H5Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 3L15 8L12 13L9 8L12 3Z" stroke="currentColor"/></IconWrapper>;
export const MatrixIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M6 3V21M12 3V21M18 3V21" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M3 6H21M3 12H21M3 18H21" stroke="currentColor"/></IconWrapper>;
export const BladeRunnerIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M3 21H21" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M5 21V11L12 3L19 11V21" stroke="currentColor"/></IconWrapper>;
export const WesAndersonIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M3 12H21M12 3V21" stroke="currentColor"/></IconWrapper>;
export const MadMaxIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="9" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 3V21M3 12H21" stroke="currentColor"/><path d="M9 10L15 14M9 14L15 10" stroke="url(#duotone-gradient-alt)"/></IconWrapper>;
export const AmelieIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M21.27,13.22,12,22.5,2.73,13.22A5.9,5.9,0,0,1,2,9.39,6,6,0,0,1,8,3a5.8,5.8,0,0,1,4,1.91A5.8,5.8,0,0,1,16,3a6,6,0,0,1,6,6.39A5.9,5.9,0,0,1,21.27,13.22Z" fill="url(#duotone-gradient)" stroke="none"/></IconWrapper>;

// New filter icons
export const GoldenHourIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2V8M18 6L16 9M6 6L8 9M21 12H3" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12" stroke="currentColor"/></IconWrapper>;
export const MonochromeIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.5"/><path d="M12 2A10 10 0 0 0 12 22Z" fill="url(#duotone-gradient)" stroke="none"/></IconWrapper>;
export const SketchIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M17 3L7 13L11 17L21 7L17 3Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M7 13L3 17V21H7L11 17M17 8L16 7" stroke="currentColor"/></IconWrapper>;
export const OrigamiIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M2 20L12 10L22 20L12 18L2 20Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 10L20 4L14 8L12 10Z" stroke="currentColor"/><path opacity="0.5" d="M12 10L4 4L10 8L12 10Z" stroke="currentColor"/></IconWrapper>;
export const UkiyoeIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M2 18C2 18 6 14 12 14C18 14 22 18 22 18" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M2 14C2 14 6 10 12 10C18 10 22 14 22 14" stroke="currentColor"/><path d="M16 8L14 6L10 10" stroke="url(#duotone-gradient)"/></IconWrapper>;
export const VanGoghIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 6C9.5 6 8 7.5 8 9C8 10.5 9.5 12 12 12C14.5 12 16 13.5 16 15C16 16.5 14.5 18 12 18" stroke="currentColor" strokeLinecap="round"/></IconWrapper>;
export const GhibliIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M4.5 16C3.5 14 3 12 5 10C7 8 9 9 10 11" stroke="url(#duotone-gradient)" strokeLinecap="round"/><path opacity="0.5" d="M13 18C13 16 13 13 15 12C17 11 19 12 20 14" stroke="currentColor" strokeLinecap="round"/><path d="M8 15C7 13 8 10 10 9C12 8 14 9 15 11" stroke="url(#duotone-gradient)" strokeLinecap="round"/></IconWrapper>;
export const DuneIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="16" cy="7" r="4" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M10 9C10 7.89543 9.10457 7 8 7C6.89543 7 6 7.89543 6 9" stroke="currentColor"/><path d="M2 20C2 20 6 16 12 16C18 16 22 20 22 20" stroke="url(#duotone-gradient)"/></IconWrapper>;
export const ArcaneIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 2V22M4 6L20 18M20 6L4 18" stroke="currentColor"/></IconWrapper>;
export const SpiderVerseIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2V22M2 12H22M4.92969 4.92969L19.0711 19.0711M4.92896 19.0711L19.0711 4.92896" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 8L8 12L12 16L16 12L12 8Z" stroke="currentColor"/><path d="M11 2L10 3M13 2L14 3M22 11L21 10M22 13L21 14M13 22L14 21M11 22L10 21M2 13L3 14M2 11L3 10" stroke="currentColor" strokeLinecap="round"/></IconWrapper>;

// New video creator icons
export const TimeIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M12 7V12L15 13.5" stroke="currentColor"/></IconWrapper>;
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M2 8V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V8L18 4H6L2 8Z" stroke="url(#duotone-gradient)"/><circle opacity="0.5" cx="12" cy="13" r="4" stroke="currentColor"/></IconWrapper>;
export const CinematicIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="2" y="5" width="20" height="14" rx="2" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M2 9H22M2 15H22" stroke="currentColor"/></IconWrapper>;
export const RealisticIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="url(#duotone-gradient)"/><path opacity="0.5" d="M7 14L10 11L12.5 13.5L14.5 10.5L17 14" stroke="currentColor"/></IconWrapper>;
export const AnimatedIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="url(#duotone-gradient)"/></IconWrapper>;
export const HyperlapseIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><path d="M3 12H7L10 3L14 21L17 12H21" stroke="url(#duotone-gradient)"/></IconWrapper>;

// Added new icons for new filters
export const BokehIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><circle cx="8" cy="8" r="4" fill="url(#duotone-gradient)" fillOpacity="0.7" stroke="none"/><circle cx="16" cy="10" r="6" fill="url(#duotone-gradient-alt)" fillOpacity="0.7" stroke="none"/><circle cx="12" cy="18" r="3" fill="url(#duotone-gradient)" fillOpacity="0.7" stroke="none"/></IconWrapper>;
export const LightLeakIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" opacity="0.5"/><path d="M2 7L22 17" stroke="url(#duotone-gradient)" strokeWidth="3"/><path d="M2 12L22 22" stroke="url(#duotone-gradient-alt)" strokeWidth="3" opacity="0.6"/></IconWrapper>;
export const Anaglyph3DIcon: React.FC<{ className?: string }> = ({ className }) => <IconWrapper className={className}><rect x="4" y="4" width="15" height="15" rx="2" stroke="cyan" opacity="0.8"/><rect x="6" y="6" width="15" height="15" rx="2" stroke="red" opacity="0.8"/></IconWrapper>;