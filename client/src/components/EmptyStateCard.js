export default function EmptyStateCard({ onResetFilters, onBecomeEntrepreneur }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">🧵</div>
      <h3>No artisans yet</h3>
      <p>
        The marketplace is currently quiet, but it’s ready for new entrepreneurs to join.
        Try resetting your filters or create a profile to start showcasing your craft.
      </p>
      <div className="empty-state-actions">
        <button type="button" className="btn btn-outline" onClick={onResetFilters}>Reset Filters</button>
        <button type="button" className="btn btn-primary" onClick={onBecomeEntrepreneur}>Become an Entrepreneur</button>
      </div>
    </div>
  );
}
