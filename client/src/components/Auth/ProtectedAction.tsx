import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/config/permissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface ProtectedActionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  showDisabled?: boolean;
  disabledMessage?: string;
}

/**
 * Component wrapper that conditionally renders children based on permissions
 *
 * Usage:
 * <ProtectedAction permission="create:residents">
 *   <Button>Create Resident</Button>
 * </ProtectedAction>
 */
export function ProtectedAction({
  permission,
  children,
  fallback = null,
  showDisabled = false,
  disabledMessage = 'You do not have permission to perform this action',
}: ProtectedActionProps) {
  const { can, isLoading } = usePermissions();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // User has permission - render normally
  if (can(permission)) {
    return <>{children}</>;
  }

  // User lacks permission
  if (showDisabled) {
    // Show disabled version with tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative inline-block opacity-50 cursor-not-allowed">
              {children}
              <div className="absolute inset-0 cursor-not-allowed" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              <span>{disabledMessage}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Render fallback or nothing
  return <>{fallback}</>;
}

interface ProtectedButtonProps extends ProtectedActionProps {
  className?: string;
}

/**
 * Specialized version for buttons that automatically disables the button
 */
export function ProtectedButton({
  permission,
  children,
  disabledMessage,
  className,
}: ProtectedButtonProps) {
  const { can, isLoading } = usePermissions();

  const hasPermission = !isLoading && can(permission);

  if (isLoading) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>
            {typeof children === 'function'
              ? children({ disabled: !hasPermission })
              : children}
          </span>
        </TooltipTrigger>
        {!hasPermission && (
          <TooltipContent>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              <span>{disabledMessage || 'Insufficient permissions'}</span>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

interface ConditionalRenderProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Simple conditional render based on permissions
 * No disabled state - just show or hide
 */
export function ConditionalRender({
  permission,
  requireAll = false,
  children,
  fallback = null,
}: ConditionalRenderProps) {
  const { can, canAll, canAny, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll ? canAll(permission) : canAny(permission);
  } else {
    hasAccess = can(permission);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
