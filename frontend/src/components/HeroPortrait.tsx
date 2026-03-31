import { useState } from 'react';
import { cn } from '../lib/utils';

type HeroPortraitProps = {
  name: string;
  imageUrl?: string;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
  labelClassName?: string;
};

export default function HeroPortrait({
  name,
  imageUrl,
  className,
  fallbackClassName,
  imgClassName,
  labelClassName,
}: HeroPortraitProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div className={cn('relative overflow-hidden bg-tactical-bg', className)}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          className={cn('h-full w-full object-cover', imgClassName)}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <div className={cn('absolute inset-0 opacity-20', fallbackClassName)} />
          <span className={cn('absolute inset-0 flex items-center justify-center px-2 text-center font-bold', labelClassName)}>
            {name}
          </span>
        </>
      )}
    </div>
  );
}
