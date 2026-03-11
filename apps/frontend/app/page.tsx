import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="card text-center">
          {/* Logo/Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CFB Digitale Passstelle
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Spielerpass-Anträge des CfB Ford Niehl e.V.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Schnell</h3>
              <p className="text-sm text-gray-600">Nur 5-10 Minuten</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sicher</h3>
              <p className="text-sm text-gray-600">DSGVO-konform</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Transparent</h3>
              <p className="text-sm text-gray-600">Echtzeit-Status</p>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/register" className="btn-primary inline-block px-8 py-4 text-lg">
            Jetzt Spielerpass beantragen
          </Link>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              CfB Ford Niehl e.V. • Digitale Passstelle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
