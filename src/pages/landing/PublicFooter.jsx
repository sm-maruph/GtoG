/**
 * PublicFooter — institutional footer, mirrors the bank's real address block.
 */

export default function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <p className="lp-footer-org">Commercial Bank of Ceylon PLC &mdash; Bangladesh Operation</p>
        <p className="lp-footer-addr">
          Hadi Tower, House No. NW(K)-1, Road No. 50, Kemal Ataturk Avenue,
          Gulshan&ndash;2, Dhaka&ndash;1212. P.O. Box No. 3490
        </p>
        <p className="lp-footer-meta">&copy; {year} Commercial Bank of Ceylon PLC. Internal use only.</p>
      </div>
    </footer>
  );
}
