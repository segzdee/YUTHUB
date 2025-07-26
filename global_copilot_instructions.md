# Global GitHub Copilot Instructions

## Save this file as `~/.copilot/instructions.md` for global application

## General Development Principles

### Security First
- Always validate and sanitize user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Never expose sensitive data in error messages
- Use HTTPS and secure headers for all communications
- Implement rate limiting for API endpoints

### Accessibility Standards
- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Include proper ARIA labels and descriptions
- Ensure keyboard navigation support
- Maintain sufficient color contrast ratios
- Provide alternative text for images
- Test with screen readers

### Performance Optimization
- Implement code splitting and lazy loading
- Optimize images and compress assets
- Use efficient database queries with proper indexing
- Minimize bundle sizes and eliminate dead code
- Implement proper caching strategies
- Monitor Core Web Vitals

### Type Safety
- Use TypeScript for all JavaScript projects
- Define explicit interfaces and types
- Avoid using 'any' type unless absolutely necessary
- Use strict TypeScript configuration
- Implement proper error handling with typed errors
- Use generic types for reusable components

### Code Quality
- Write self-documenting code with meaningful names
- Keep functions small and focused on single responsibility
- Use consistent code formatting and linting
- Write comprehensive tests for critical functionality
- Include proper error handling and logging
- Follow established design patterns

### Mobile-First Design
- Design for mobile devices first (320px+)
- Use responsive design principles
- Implement touch-friendly interfaces (44px minimum touch targets)
- Optimize for slow network connections
- Consider offline functionality for critical features
- Test on actual mobile devices

### Database Best Practices
- Use proper normalization and relationships
- Implement appropriate indexes for query optimization
- Include created_at and updated_at timestamps
- Use transactions for data consistency
- Implement proper backup and recovery procedures
- Monitor database performance and query execution

### API Design
- Follow RESTful principles and conventions
- Use consistent response formats
- Implement proper HTTP status codes
- Include comprehensive error handling
- Document API endpoints thoroughly
- Version APIs for backward compatibility

### Testing Strategy
- Write unit tests for business logic
- Implement integration tests for API endpoints
- Use end-to-end tests for critical user workflows
- Test accessibility with automated tools
- Perform security testing and vulnerability scanning
- Include performance testing for scalability

### Documentation
- Write clear and comprehensive README files
- Document API endpoints with examples
- Include installation and setup instructions
- Maintain up-to-date dependency information
- Document architectural decisions and patterns
- Provide troubleshooting guides

## Common Patterns

### Error Handling Pattern
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: 'User-friendly error message',
    code: error.code || 'UNKNOWN_ERROR'
  };
}
```

### React Component Pattern
```typescript
interface ComponentProps {
  // Explicit prop types
}

const Component: React.FC<ComponentProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Always handle loading and error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary error={error} />;
  
  return (
    <div className="responsive-container">
      {/* Accessible, semantic HTML */}
    </div>
  );
};
```

### API Response Pattern
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}
```

## Environment-Specific Guidelines

### Development
- Use development-specific logging and debugging
- Implement hot reloading and fast refresh
- Use development-friendly error messages
- Enable source maps for debugging
- Use mock data and services when appropriate

### Production
- Minimize bundle sizes and optimize for performance
- Use production-grade error logging and monitoring
- Implement proper security headers and HTTPS
- Use CDN for static asset delivery
- Enable compression and caching

### Testing
- Use test databases and mock external services
- Implement proper test isolation and cleanup
- Use deterministic test data and scenarios
- Enable code coverage reporting
- Run tests in CI/CD pipelines

## Team Collaboration

### Code Reviews
- Review for security vulnerabilities
- Check accessibility compliance
- Verify performance implications
- Ensure proper testing coverage
- Validate documentation completeness

### Git Workflow
- Use descriptive commit messages
- Create feature branches for new development
- Implement pull request templates
- Use semantic versioning for releases
- Maintain clean commit history

### Communication
- Document architectural decisions
- Share knowledge through code comments
- Use consistent naming conventions
- Provide context in pull requests
- Maintain up-to-date project documentation

This global configuration ensures consistent development practices across all projects while maintaining high standards for security, accessibility, and performance.