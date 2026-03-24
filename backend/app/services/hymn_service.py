"""
Hymn Service
============
Business logic for hymn operations.
"""

from typing import Dict, List, Optional
import yaml
from pathlib import Path

from app.models.hymn import Hymn, Hymnbook
from app.core.config import settings


class HymnService:
    """Service for managing hymns and hymnbooks."""
    
    _hymnbooks: Dict[str, Hymnbook] = {}
    _initialized: bool = False
    
    @classmethod
    def _process_verses(cls, verses: List) -> List[str]:
        """Process verses and detect CORO (chorus) sections."""
        if not isinstance(verses, list):
            return []
        
        processed = []
        for verse in verses:
            text = str(verse).strip()
            # If it starts with "CORO", mark it with special anchor
            if text.upper().startswith("CORO"):
                lines = text.split('\n')
                header = lines[0].strip()
                body = '\n'.join(lines[1:]).strip()
                processed.append(f"@CORO@{header}\n{body}")
            else:
                processed.append(text)
        
        return processed
    
    @classmethod
    def load_hymnbooks(cls, yaml_path: Optional[str] = None) -> Dict[str, Hymnbook]:
        """Load hymnbooks from YAML file."""
        if cls._initialized and cls._hymnbooks:
            return cls._hymnbooks
        
        path = Path(yaml_path or settings.HYMNS_YAML_PATH)
        
        if not path.exists():
            # Try alternate paths
            alternate_paths = [
                Path(__file__).parent.parent.parent.parent / "frontend" / "src" / "app" / "data" / "hymns.yaml",
                Path(__file__).parent.parent.parent.parent / "src" / "app" / "data" / "hymns.yaml",
            ]
            for alt_path in alternate_paths:
                if alt_path.exists():
                    path = alt_path
                    break
        
        if not path.exists():
            print(f"[HymnService] YAML file not found: {path}")
            return {}
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                parsed = yaml.safe_load(f)
            
            if parsed is None:
                return {}
            
            # Case 1: Direct array
            if isinstance(parsed, list):
                cls._hymnbooks = {
                    'default': Hymnbook(
                        id='default',
                        name='Himnario',
                        hymns=[
                            Hymn(
                                number=h.get('number', i + 1) if isinstance(h, dict) else i + 1,
                                title=h.get('title', 'Sin título') if isinstance(h, dict) else 'Sin título',
                                verses=cls._process_verses(h.get('verses', []) if isinstance(h, dict) else [])
                            )
                            for i, h in enumerate(parsed)
                        ]
                    )
                }
            # Case 2: Multiple hymnbooks
            elif isinstance(parsed, dict):
                cls._hymnbooks = {}
                for book_id, book_data in parsed.items():
                    if not isinstance(book_data, dict):
                        continue
                    
                    hymns_data = book_data.get('hymns', [])
                    if not isinstance(hymns_data, list):
                        hymns_data = []
                    
                    cls._hymnbooks[book_id] = Hymnbook(
                        id=book_id,
                        name=book_data.get('name', book_id),
                        hymns=[
                            Hymn(
                                number=h.get('number', i + 1) if isinstance(h, dict) else i + 1,
                                title=h.get('title', 'Sin título') if isinstance(h, dict) else 'Sin título',
                                verses=cls._process_verses(h.get('verses', []) if isinstance(h, dict) else [])
                            )
                            for i, h in enumerate(hymns_data)
                        ]
                    )
            
            cls._initialized = True
            print(f"[HymnService] Loaded {len(cls._hymnbooks)} hymnbooks")
            
        except Exception as e:
            print(f"[HymnService] Error loading YAML: {e}")
            return {}
        
        return cls._hymnbooks
    
    @classmethod
    def get_all_hymnbooks(cls) -> Dict[str, Hymnbook]:
        """Get all available hymnbooks."""
        if not cls._initialized:
            cls.load_hymnbooks()
        return cls._hymnbooks
    
    @classmethod
    def get_hymnbook(cls, hymnbook_id: str) -> Optional[Hymnbook]:
        """Get a specific hymnbook by ID."""
        hymnbooks = cls.get_all_hymnbooks()
        return hymnbooks.get(hymnbook_id)
    
    @classmethod
    def get_hymn(cls, hymnbook_id: str, hymn_number: int) -> Optional[Hymn]:
        """Get a specific hymn by number from a hymnbook."""
        hymnbook = cls.get_hymnbook(hymnbook_id)
        if not hymnbook:
            return None
        
        for hymn in hymnbook.hymns:
            if hymn.number == hymn_number:
                return hymn
        
        return None
    
    @classmethod
    def search_hymns(cls, hymnbook_id: str, query: str = "") -> List[Hymn]:
        """Search hymns by number or title."""
        hymnbook = cls.get_hymnbook(hymnbook_id)
        if not hymnbook:
            return []
        
        normalized_query = query.lower().strip()
        
        if not normalized_query:
            return hymnbook.hymns
        
        results = []
        for hymn in hymnbook.hymns:
            if (str(hymn.number) in normalized_query or 
                normalized_query in str(hymn.number) or
                normalized_query in hymn.title.lower()):
                results.append(hymn)
        
        return results
    
    @classmethod
    def reload_hymnbooks(cls) -> Dict[str, Hymnbook]:
        """Force reload hymnbooks from YAML."""
        cls._initialized = False
        cls._hymnbooks = {}
        return cls.load_hymnbooks()


# Initialize service instance
hymn_service = HymnService()
