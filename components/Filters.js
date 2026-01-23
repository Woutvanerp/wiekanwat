'use client'

export default function Filters({ 
  locations,
  hierarchyLevels, 
  skills, 
  clients,
  filters,
  onFilterChange 
}) {
  const handleLocationChange = (value) => {
    onFilterChange({ ...filters, location: value })
  }

  const handleHierarchyChange = (value) => {
    onFilterChange({ ...filters, hierarchy: value })
  }

  const handleSkillChange = (value) => {
    onFilterChange({ ...filters, skill: value })
  }

  const handleClientChange = (value) => {
    onFilterChange({ ...filters, client: value })
  }

  const handleClearFilters = () => {
    onFilterChange({
      location: '',
      hierarchy: '',
      skill: '',
      client: '',
    })
  }

  const hasActiveFilters = filters.location || filters.hierarchy || filters.skill || filters.client

  return (
    <div className="filters-top">
      <div className="filters-header">
        <h2>Filters</h2>
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Alles Wissen
          </button>
        )}
      </div>
      
      <div className="filters-content">
        {/* Location Pills */}
        <div className="filter-group">
          <label>Locatie</label>
          <div className="filter-pills">
            <button
              className={`filter-pill ${filters.location === '' ? 'active' : ''}`}
              onClick={() => handleLocationChange('')}
            >
              Alle Locaties
            </button>
            {locations.map(location => (
              <button
                key={location}
                className={`filter-pill ${filters.location === location ? 'active' : ''}`}
                onClick={() => handleLocationChange(location)}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Hierarchy Level Pills */}
        <div className="filter-group">
          <label>Hiërarchieniveau</label>
          <div className="filter-pills">
            <button
              className={`filter-pill ${filters.hierarchy === '' ? 'active' : ''}`}
              onClick={() => handleHierarchyChange('')}
            >
              Alle Niveaus
            </button>
            {hierarchyLevels.map(level => (
              <button
                key={level}
                className={`filter-pill ${filters.hierarchy === level ? 'active' : ''}`}
                onClick={() => handleHierarchyChange(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Dropdown */}
        <div className="filter-group">
          <label htmlFor="skill-filter">Vaardigheid</label>
          <select
            id="skill-filter"
            value={filters.skill}
            onChange={(e) => handleSkillChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Vaardigheden</option>
            {skills.map(skill => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Client Dropdown */}
        <div className="filter-group">
          <label htmlFor="client-filter">Huidige Klant</label>
          <select
            id="client-filter"
            value={filters.client}
            onChange={(e) => handleClientChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Klanten</option>
            <option value="available">Beschikbaar</option>
            {clients.map(client => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
