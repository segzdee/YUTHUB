import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  padded?: 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    hoverable = true,
    padded = 'md',
    className = '',
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-xl border border-gray-200
          ${paddingStyles[padded]}
          shadow-sm transition-all duration-300
          ${hoverable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  href,
}) => {
  const content = (
    <>
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-2xl font-600 text-black mb-2">{title}</h3>
      <p className="text-base font-400 text-gray-600">{description}</p>
    </>
  );

  return (
    <Card hoverable={!!href} className="text-center" padded="lg">
      {href ? (
        <a href={href} className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </Card>
  );
};

interface PricingCardProps {
  tier: 'starter' | 'professional' | 'enterprise';
  name: string;
  price?: string | number;
  description: string;
  features: string[];
  cta: string;
  onCtaClick?: () => void;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  name,
  price,
  description,
  features,
  cta,
  onCtaClick,
  isPopular = false,
}) => {
  return (
    <Card
      hoverable={false}
      className={`relative flex flex-col ${
        isPopular ? 'ring-4 ring-blue-600 shadow-xl scale-[1.05] bg-gradient-to-b from-blue-50 to-white' : ''
      }`}
      padded="lg"
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-700 px-4 py-1.5 rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-600 text-black mb-2">{name}</h3>
        <p className="text-base font-400 text-gray-600">{description}</p>
      </div>

      {price && (
        <div className="mb-6">
          <span className="text-5xl font-600 text-black">£{price}</span>
          <span className="text-base font-400 text-gray-600 ml-2">/mo</span>
        </div>
      )}

      <button
        onClick={onCtaClick}
        className={`w-full py-3 rounded-lg font-600 transition-all duration-150 mb-6 ${
          isPopular
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-105'
            : 'bg-transparent border-2 border-gray-300 text-black hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        {cta}
      </button>

      <div className="space-y-3">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-base font-400 text-gray-600">{feature}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
