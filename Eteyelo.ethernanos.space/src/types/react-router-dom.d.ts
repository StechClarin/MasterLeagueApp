/* ============================================================================
 * Déclarations locales pour `react-router-dom` v7.
 *
 * Contexte : le paquet publié react-router@7.17.0 est livré SANS ses fichiers
 * de types (dist/development/index.d.ts manquant). Pour que `tsc` fonctionne,
 * on fournit ici un typage minimal des seuls symboles réellement utilisés par
 * cette application (composants + hooks).
 * La résolution de types de node_modules a été retirée (les .d.ts cassés de
 * react-router-dom/dist ont été supprimés), ce fichier prend alors le relais.
 * ========================================================================== */
declare module 'react-router-dom' {
  import type { ReactNode, ReactElement } from 'react';

  export interface BrowserRouterProps {
    children?: ReactNode;
    basename?: string;
    future?: Record<string, unknown>;
  }

  export interface RouteProps {
    path?: string;
    index?: boolean;
    element?: ReactNode;
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface NavLinkState {
    isActive: boolean;
    isPending?: boolean;
    isTransitioning?: boolean;
  }

  export interface NavLinkProps {
    to: string | { pathname?: string; search?: string; hash?: string };
    end?: boolean;
    className?: string | ((state: NavLinkState) => string | undefined);
    style?:
      | React.CSSProperties
      | ((state: NavLinkState) => React.CSSProperties | undefined);
    children?: ReactNode;
    title?: string;
    [key: string]: unknown;
  }

  export interface NavigateProps {
    to: string | { pathname?: string; search?: string; hash?: string };
    replace?: boolean;
    state?: unknown;
  }

  export function BrowserRouter(props: BrowserRouterProps): ReactElement;
  export function Routes(props: { children?: ReactNode }): ReactElement;
  export function Route(props: RouteProps): ReactElement | null;
  export function NavLink(props: NavLinkProps): ReactElement;
  export function Outlet(): ReactElement | null;
  export function Navigate(props: NavigateProps): ReactElement | null;

  export function useNavigate(): (
    to: string | { pathname?: string; search?: string; hash?: string },
    options?: { replace?: boolean; state?: unknown },
  ) => void;

  export interface PortalLocation {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key?: string;
  }

  export function useLocation(): PortalLocation;

  export function useParams<
    P extends Record<string, string | undefined> = Record<string, string | undefined>,
  >(): P;

  export function useSearchParams(): [
    URLSearchParams,
    (nextInit: Record<string, string | string[]> | string, navigateOptions?: unknown) => void,
  ];
}
