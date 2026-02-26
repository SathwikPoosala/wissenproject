import React from 'react';
import './Card.css';

const Card = ({ children, className = '', title, subtitle, icon, action }) => {
  return (
    <div className={`card ${className}`}>
      {(title || icon || action) && (
        <div className="card-header">
          <div className="card-header-content">
            {icon && <div className="card-icon">{icon}</div>}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
